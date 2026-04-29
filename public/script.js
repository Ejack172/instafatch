// ── Paste button
document.getElementById('pasteBtn').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('linkInput').value = text;
  } catch {
    document.getElementById('linkInput').focus();
  }
});

// ── Navbar scroll shadow
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.boxShadow =
    window.scrollY > 10 ? '0 4px 32px rgba(0,0,0,0.4)' : 'none';
}, { passive: true });

// ── FAQ accordion
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

// ── Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Intersection Observer for fade-in
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.format-card, .step-card, .feature-item, .faq-item')
  .forEach(el => observer.observe(el));

// ── Main download form
document.getElementById('downloadForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const input = document.getElementById('linkInput');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  const downloadLink = document.getElementById('downloadLink');
  const errorMsg = document.getElementById('errorMsg');

  const url = input.value.trim();

  // Reset
  resultDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');
  submitBtn.disabled = true;
  input.disabled = true;
  btnText.textContent = 'Fetching...';
  btnSpinner.classList.remove('hidden');

  try {
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      downloadLink.href = data.mediaUrl;
      resultDiv.classList.remove('hidden');
    } else {
      errorMsg.textContent = data.message || 'Failed to fetch media. Try again.';
      errorDiv.classList.remove('hidden');
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = 'Network error. Please check your connection and try again.';
    errorDiv.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    input.disabled = false;
    btnText.textContent = 'Download';
    btnSpinner.classList.add('hidden');
  }
});
