document.addEventListener('DOMContentLoaded', function() {  
  // wait for HTML to load first then load js

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  document.querySelector('#compose-form').addEventListener('submit', send_email());
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
   
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-detail-view').style.display = 'block';

      document.querySelector('#emails-detail-view').innerHTML=`
          <ul class="list-group">
      <li class="list-group-item"><strong>From: </strong>${email.sender}</li>
      <li class="list-group-item"><strong>To: </strong>${email.recipients}</li>
      <li class="list-group-item"><strong>Subject: </strong>${email.subject}</li>
      <li class="list-group-item"><strong>Timestamp: </strong>${email.timestamp}</li>
      <li class="list-group-item">${email.body}</li>
    </ul>
      `

      //change to read
      if(!email.read){
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      }
      // archieve/unarchieve logic
          const btn_arch = document.createElement('button');
    btn_arch.innerHTML = email.archived?"Unarchive":"Archive";
    btn_arch.className = email.archived?"btn btn-sucess":"btn btn-danger";
    btn_arch.addEventListener('click', function() {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email.archived
        })
      })
      .then(()=>{load_mailbox('archive')})

    });
    document.querySelector('#emails-detail-view').append(btn_arch);

    //reply logic
    const btn_reply = document.createElement('button');
    btn_reply.innerHTML = "Reply";
    btn_reply.className = "btn btn-info";

    btn_reply.addEventListener('click', function() {
    compose_email();
    document.querySelector('#compose-recipients').value = email.sender;
    let s=email.subject;
    if(s.split(' ',1)[0] != "Re:"){
      s="Re: "+email.subject;
    }
    document.querySelector('#compose-subject').value = s;
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    });
    document.querySelector('#emails-detail-view').append(btn_reply);


  });
  }

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // get the emails for that mailbox and user
      fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        //loop thorugh emails and create a div for each
        emails.forEach(singleEmail => {
          //create div for each email
          console.log(singleEmail);
        const newEmail = document.createElement('div');
        newEmail.className="list-group-item";

        newEmail.innerHTML = `
        <h6>Sender: ${singleEmail.sender}</h6>
        <h5>Subject: ${singleEmail.subject} </h5>
        <p>${singleEmail.timestamp}</p>
        `;
        // change bg colour for read
          newEmail.className=singleEmail.read?'read':'unread';
        // add click event to view email
        newEmail.addEventListener('click',function(){
          view_email(singleEmail.id)
        });
        document.querySelector('#emails-view').append(newEmail);

        });
    });
}



function send_email(e){
  e.preventDefault();
  // store fields
 const recipients = document.querySelector('#compose-recipients').value;
 const subject = document.querySelector('#compose-subject').value;
 const body = document.querySelector('#compose-body').value;

//  send to backend
fetch('/emails', {
  method: 'POST',
  body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
  })
})
.then(response => response.json())
.then(result => {
    // Print result
    console.log(result);
    load_mailbox('sent');
});
}

