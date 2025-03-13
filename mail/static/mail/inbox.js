document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view_email(id){
  fetch(`emails/${id}`)
  .then(response => response.json())
  .then(emails=>{
    console.log(emails)
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-detail-view').style.display = 'block';
    document.querySelector('#email-detail-view').innerHTML = `
    <ul class="list-group">
      <li class="list-group-item"><strong>From: </strong>${emails.sender}</li>
      <li class="list-group-item"><strong>TO: </strong>${emails.recipients}</li>
      <li class="list-group-item"><strong>Subject: </strong>${emails.subject}</li>
      <li class="list-group-item"><strong>Timestamp: </strong>${emails.timestamp}</li>
      <li class="list-group-item">${emails.body}</li>
    </ul>`;
    if(!emails.read){
      fetch(`/emails/${emails.id}`),{
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      }
    }

    const btn_arch = document.createElement('button');
    btn_arch.innerHTML = emails.archived ? 'Unarchive': 'Archive';
    btn_arch.className = emails.archived ? "btn btn-success": "btn btn-danger";
    btn_arch.addEventListener('click', function(){
        fetch(`emails/${emails.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !emails.archived   
          })
        })
        .then(()=>{load_mailbox('archive')})
      });
      document.querySelector('#email-detail-view').style.display = 'block';
    document.querySelector('#email-detail-view').append(btn_arch);

    const btn_reply = document.createElement('button');
    btn_reply.innerHTML = "Reply";
    btn_reply.className = "btn btn-info";
    btn_reply.addEventListener('click', function(){
      compose_email();
      document.querySelector('#compose-recipients').value = emails.sender;
      let subject = emails.subject;
      if (!emails.subject.startsWith("Re:")) {
        subject = "Re: " + emails.subject;
      }
      document.querySelector('#compose-subject').value = subject;
      document.querySelector('#compose-body').value = `on ${emails.timestamp} ${emails.sender} wrote: ${emails.body}`;
    });
    document.querySelector('#email-detail-view').append(btn_reply);
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails =>{
      emails.forEach(singleEmail => {
        const newEmail = document.createElement('div');
        newEmail.className = 'list-group-item';
        newEmail.className = singleEmail.read ? 'read': 'unread';
        newEmail.innerHTML = `
          <h6>sender: ${singleEmail.sender}</h6>
          <h5>subject: ${singleEmail.subject}</h5>
          <p>${singleEmail.timestamp}</p>`;
        newEmail.addEventListener('click', function(){
          view_email(singleEmail.id);
        });
          document.querySelector("#emails-view").append(newEmail);
      });
    });
}

function send_email(event){
  event.preventDefault();
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails',{
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    }),
  })
  .then(response => response.json())
  .then(result=>{
    console.log(result);
    load_mailbox('sent');
  });
}