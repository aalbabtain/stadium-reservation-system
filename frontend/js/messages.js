document.addEventListener('DOMContentLoaded', () => {
  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      fetch('../backend/Authentication/logout.php')
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            window.location.href = 'index.html';
          } else {
            alert("Logout failed: " + data.message);
          }
        })
        .catch(err => {
          console.error("Logout error:", err);
          alert("An error occurred during logout.");
        });
    });
  }

  // Load messages on page load
  loadInbox();
  loadSentMessages();
  loadUserList();

  // Compose form submission
  const composeForm = document.getElementById('composeForm');
  if (composeForm) {
    composeForm.addEventListener('submit', e => {
      e.preventDefault();
      sendMessage();
    });
  }

  // Tab change events to reload data
  document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', event => {
      const target = event.target.getAttribute('data-bs-target');
      if (target === '#inbox') {
        loadInbox();
      } else if (target === '#sent') {
        loadSentMessages();
      } else if (target === '#compose') {
        loadUserList();
      }
    });
  });
});

function loadInbox() {
  fetch('../backend/Messaging/messages.php?action=inbox')
    .then(res => res.json())
    .then(data => {
      const inboxList = document.getElementById('inboxList');
      inboxList.innerHTML = '';

      if (!Array.isArray(data) || data.length === 0) {
        inboxList.innerHTML = '<p class="text-muted">No messages received yet</p>';
        return;
      }

      data.forEach(msg => {
        const roleLabel = msg.sender_role === 'owner' ? 'Owner' : 'User';
        const date = new Date(msg.sent_at).toLocaleString();
        
        const msgItem = document.createElement('div');
        msgItem.className = 'list-group-item';
        msgItem.innerHTML = `
          <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">From: ${msg.sender_name} <span class="badge bg-info">${roleLabel}</span></h6>
            <small class="text-muted">${date}</small>
          </div>
          <p class="mb-1">${escapeHtml(msg.message)}</p>
        `;
        inboxList.appendChild(msgItem);
      });
    })
    .catch(err => {
      console.error("Failed to load inbox:", err);
      document.getElementById('inboxList').innerHTML = '<p class="text-danger">Failed to load messages</p>';
    });
}

function loadSentMessages() {
  fetch('../backend/Messaging/messages.php?action=sent')
    .then(res => res.json())
    .then(data => {
      const sentList = document.getElementById('sentList');
      sentList.innerHTML = '';

      if (!Array.isArray(data) || data.length === 0) {
        sentList.innerHTML = '<p class="text-muted">No sent messages yet</p>';
        return;
      }

      data.forEach(msg => {
        const roleLabel = msg.receiver_role === 'owner' ? 'Owner' : 'User';
        const date = new Date(msg.sent_at).toLocaleString();
        
        const msgItem = document.createElement('div');
        msgItem.className = 'list-group-item';
        msgItem.innerHTML = `
          <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">To: ${msg.receiver_name} <span class="badge bg-info">${roleLabel}</span></h6>
            <small class="text-muted">${date}</small>
          </div>
          <p class="mb-1">${escapeHtml(msg.message)}</p>
        `;
        sentList.appendChild(msgItem);
      });
    })
    .catch(err => {
      console.error("Failed to load sent messages:", err);
      document.getElementById('sentList').innerHTML = '<p class="text-danger">Failed to load messages</p>';
    });
}

function loadUserList() {
  fetch('../backend/Messaging/messages.php?action=get_users')
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('receiverSelect');
      select.innerHTML = '<option value="">Select Recipient</option>';

      if (!Array.isArray(data) || data.length === 0) {
        select.innerHTML = '<option value="">No users available to message</option>';
        return;
      }

      data.forEach(user => {
        const roleLabel = user.role === 'owner' ? 'Owner' : 'User';
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.username} (${roleLabel})`;
        select.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Failed to load users:", err);
    });
}

function sendMessage() {
  const form = document.getElementById('composeForm');
  const formData = new FormData(form);

  fetch('../backend/Messaging/messages.php?action=send', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        alert(data.message);
        form.reset();
        loadSentMessages();
        // Switch to sent tab
        document.querySelector('button[data-bs-target="#sent"]').click();
      } else {
        alert('Error: ' + data.message);
      }
    })
    .catch(err => {
      console.error("Send message error:", err);
      alert("Failed to send message");
    });
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}