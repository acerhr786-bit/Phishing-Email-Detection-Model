document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('scanForm');
  const subjectInput = document.getElementById('emailSubject');
  const bodyInput = document.getElementById('emailBody');
  const resultsArea = document.getElementById('resultsArea');
  const predictionBadge = document.getElementById('predictionBadge');
  const riskScoreVal = document.getElementById('riskScoreVal');
  const riskProgress = document.getElementById('riskProgress');
  const phishProbVal = document.getElementById('phishProbVal');
  const safeProbVal = document.getElementById('safeProbVal');
  const keywordsList = document.getElementById('keywordsList');
  const urlFlagsList = document.getElementById('urlFlagsList');
  const recommendationsList = document.getElementById('recommendationsList');

  // Sample templates for testing
  const samplePhish = {
    subject: "URGENT: Microsoft 365 Password Expiry Warning - Action Required Within 24 Hours",
    body: "Dear User, Your Microsoft Office 365 password expires in less than 24 hours. Failure to update immediately will result in permanent suspension. Click the secure portal http://login.micros0ft-verify.com/auth/update to keep your password and avoid termination. IT Infrastructure Support."
  };

  const sampleSafe = {
    subject: "Sprint 24 Planning: Agenda and Backlog Grooming Notes",
    body: "Hi team, Here is the agenda for our Sprint 24 planning session tomorrow at 10:00 AM PST. We will review velocity from Sprint 23 (42 points) and prioritize database query optimizations. Please check the Jira board before the call. Thanks, Marcus."
  };

  document.getElementById('loadSamplePhish').addEventListener('click', () => {
    subjectInput.value = samplePhish.subject;
    bodyInput.value = samplePhish.body;
  });

  document.getElementById('loadSampleSafe').addEventListener('click', () => {
    subjectInput.value = sampleSafe.subject;
    bodyInput.value = sampleSafe.body;
  });

  document.getElementById('clearBtn').addEventListener('click', () => {
    subjectInput.value = '';
    bodyInput.value = '';
    resultsArea.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const subject = subjectInput.value.trim();
    const body = bodyInput.value.trim();

    if (!subject && !body) return;

    const scanBtn = document.getElementById('scanBtn');
    scanBtn.textContent = 'Scanning with ML...';
    scanBtn.disabled = true;

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to scan email.');
        return;
      }

      // Display results
      resultsArea.style.display = 'block';

      if (data.is_phishing) {
        predictionBadge.textContent = '⚠️ PHISHING DETECTED';
        predictionBadge.className = 'prediction-badge phishing';
        riskProgress.style.backgroundColor = '#ef4444';
      } else {
        predictionBadge.textContent = '✅ CLASSIFIED AS SAFE';
        predictionBadge.className = 'prediction-badge safe';
        riskProgress.style.backgroundColor = '#10b981';
      }

      riskScoreVal.textContent = data.risk_score;
      riskProgress.style.width = `${data.risk_score}%`;

      phishProbVal.textContent = `${(data.phishing_probability * 100).toFixed(1)}%`;
      safeProbVal.textContent = `${(data.safe_probability * 100).toFixed(1)}%`;

      // Render keywords
      keywordsList.innerHTML = '';
      if (data.matched_keywords && data.matched_keywords.length > 0) {
        data.matched_keywords.forEach(kw => {
          const badge = document.createElement('span');
          badge.className = 'tag-badge';
          badge.textContent = `kw: ${kw}`;
          keywordsList.appendChild(badge);
        });
      } else {
        keywordsList.innerHTML = '<span style="color:#9ca3af;font-size:0.85rem;">No obvious phishing trigger words detected.</span>';
      }

      // Render URL flags
      urlFlagsList.innerHTML = '';
      if (data.url_flags && data.url_flags.length > 0) {
        data.url_flags.forEach(flag => {
          const p = document.createElement('p');
          p.textContent = `• ${flag}`;
          urlFlagsList.appendChild(p);
        });
      }

      // Render recommendations
      recommendationsList.innerHTML = '';
      data.recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recommendationsList.appendChild(li);
      });

      resultsArea.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('Network error connecting to Flask backend.');
    } finally {
      scanBtn.textContent = 'Scan Email with ML Model';
      scanBtn.disabled = false;
    }
  });
});
