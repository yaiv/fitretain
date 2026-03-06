// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLCI4t842aAbidI5eYNZyAIdWG2uzXkjTEUZlH-uT3wFayzM23TK4EzMl5YEURBCY/exec';

// ─── SCALE BUTTONS ────────────────────────────────────────────────────────────
document.querySelectorAll('.scale-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const scale = btn.dataset.scale;
    const val   = btn.dataset.val;

    document.querySelectorAll(`.scale-btn[data-scale="${scale}"]`)
      .forEach(b => b.classList.remove('active'));

    btn.classList.add('active');

    const scoreInput = document.getElementById(scale + '_score');
    if (scoreInput) scoreInput.value = val;

    const featInput = document.querySelector(`input[name="${scale}"]`);
    if (featInput) featInput.value = val;

    updateProgress();
  });
});

// ─── INTERSECTION OBSERVER — section fade-in ──────────────────────────────────
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.section').forEach(section => {
  sectionObserver.observe(section);
});

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function updateProgress() {
  const sections = document.querySelectorAll('.section');
  const total    = sections.length;
  let filled     = 0;

  sections.forEach(section => {
    const requiredInputs = section.querySelectorAll('input[required], select[required]');
    let sectionDone = true;

    requiredInputs.forEach(inp => {
      if (inp.type === 'radio') {
        const group   = section.querySelectorAll(`input[name="${inp.name}"]`);
        const checked = Array.from(group).some(r => r.checked);
        if (!checked) sectionDone = false;
      } else if (!inp.value.trim()) {
        sectionDone = false;
      }
    });

    if (sectionDone) filled++;
  });

  const pct = Math.round((filled / total) * 100);
  document.getElementById('progressFill').style.width  = pct + '%';
  document.getElementById('progressLabel').textContent = `Progreso: ${pct}%`;
}

document.getElementById('mainForm').addEventListener('change', updateProgress);
document.getElementById('mainForm').addEventListener('input',  updateProgress);

// ─── RECOLECTAR DATOS DEL FORM ────────────────────────────────────────────────
function recolectarDatos(form) {
  const formData = new FormData(form);
  const data = {};

  // Agrupa checkboxes múltiples en arrays
  formData.forEach((value, key) => {
    if (data[key] !== undefined) {
      data[key] = Array.isArray(data[key])
        ? [...data[key], value]
        : [data[key], value];
    } else {
      data[key] = value;
    }
  });

  // Timestamp en formato legible
  data['timestamp'] = new Date().toLocaleString('es-MX', {
    year:   'numeric',
    month:  '2-digit',
    day:    '2-digit',
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return data;
}

// ─── MOSTRAR PANTALLA DE ÉXITO ────────────────────────────────────────────────
function mostrarExito() {
  document.getElementById('mainForm').style.display    = 'none';
  document.querySelector('.progress-wrap').style.display = 'none';
  document.getElementById('successScreen').classList.add('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── ENVIAR A GOOGLE SHEETS VÍA APPS SCRIPT ───────────────────────────────────
async function enviarASheets(data) {
  const response = await fetch(APPS_SCRIPT_URL, {
    method:  'POST',
    body:    JSON.stringify(data),
    headers: { 'Content-Type': 'text/plain' }, // text/plain evita preflight CORS
  });

  const result = await response.json();

  if (result.result !== 'success') {
    throw new Error(result.message || 'Error desconocido en Apps Script');
  }

  return result;
}

// ─── FORM SUBMIT ───────────────────────────────────────────────────────────────
document.getElementById('mainForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const btnSubmit = this.querySelector('.btn-submit');
  const textoOriginal = btnSubmit.innerHTML;

  // Estado de carga
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
         style="animation: spin 1s linear infinite;">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    Enviando...
  `;

  const data = recolectarDatos(this);

  try {
    await enviarASheets(data);
    mostrarExito();
  } catch (err) {
    console.error('Error al enviar el formulario:', err);

    // Mostrar éxito de todas formas para no bloquear al usuario
    // Los datos se perdieron en este caso — revisa la consola
    mostrarExito();
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = textoOriginal;
  }
});

// ─── ANIMACIÓN SPIN PARA EL BOTÓN DE CARGA ────────────────────────────────────
const spinStyle = document.createElement('style');
spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);


  // Mostrar/ocultar costo del software según si pagan o no
  document.querySelectorAll('input[name="pays_software"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const costBlock = document.getElementById('q-software-cost');
      costBlock.style.display = radio.value === 'si' ? 'block' : 'none';
    });
  });
  document.getElementById('q-software-cost').style.display = 'none';

  // Mostrar campo según preferencia de contacto
  document.querySelectorAll('input[name="contact_preference"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('field-whatsapp').style.display = radio.value === 'whatsapp' ? 'block' : 'none';
      document.getElementById('field-email').style.display    = radio.value === 'email'    ? 'block' : 'none';
    });
  });