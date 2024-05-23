document.addEventListener("DOMContentLoaded", function() {
  var removeUploadSVG = document.getElementById('remove-upload');
  var uploadInput = document.getElementById('upload');

  uploadInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
      var fileName = e.target.files[0].name; // Get the file name
      var filenameWrapper = document.querySelector('.formbold-filename-wrapper');
      var filenameDisplay = document.querySelector('.formbold-filename');

      // Update the filename display and make it visible
      filenameDisplay.textContent = fileName;
      filenameWrapper.style.display = 'block'; // Make it visible
      removeUploadSVG.style.display = 'block'; // Show the SVG x
    } else {
      // No file is selected, hide the SVG and filename wrapper
      filenameWrapper.style.display = 'none';
      removeUploadSVG.style.display = 'none';
    }
  });

  // Wait for click on the SVG to remove the uploaded file
  removeUploadSVG.addEventListener('click', function() {
    // Clear the file input
    uploadInput.value = '';
    
    var filenameWrapper = document.querySelector('.formbold-filename-wrapper');
    filenameWrapper.style.display = 'none';
    removeUploadSVG.style.display = 'none';
  });
});


$(document).ready(function () {

  let originalExperiences = [];
  const keywords = ['bureau', 'company', 'subsidiary', 'society', 'firm', 'association', 
  'trust', 'division', 'group', 'council', 'bank', 'team', 'center', 'organization', 
  'network', 'hospital', 'corporation', 'agency', 'commission', 'university', 'clinic', 
  'academy', 'office', 'institution', 'college', 'committee', 'institute', 
  'partnership', 'union', 'facility', 'laboratory', 'coalition', 'branch', 'service', 
  'enterprise', 'foundation', 'consortium', 'practice', 'department', 'studio', 'lab', 
  'board'];

  function displayExperiences() {
    let expList = originalExperiences;
    if ($('#filter-exp').is(':checked')) {
      expList = expList.filter(exp => 
        keywords.some(keyword => exp.toLowerCase().includes(keyword)) || exp === exp.toUpperCase()
      );
    }
    if (expList) {
      let expHtml = expList.join('<br>');
      $('#exp-list').html(expHtml);
    } else {
      $('#exp-list').text('No associated institute/organization');
    }
  }
  $('#filter-exp').change(function() {
    displayExperiences();
  });

  $('#result').click(function (event) {
    event.preventDefault();

    var formData = new FormData();
    var fileInput = document.getElementById('upload');
    var file = fileInput.files[0];
    var messageTextarea = document.getElementById('message').value.trim();

    if (file) {
      formData.append('upload', file);
    } else if (messageTextarea) {
      formData.append('message', messageTextarea);
    } else {
      alert('Please upload a file or enter text.');
      return;
    }

    $.ajax({
      type: 'POST',
      url: '/upload',
      data: formData,
      processData: false,
      contentType: false, 
      success: function (response) {
        console.log(response); 

        $('#message').text(response['FULL TEXT'])

        let contact = '';
        if (response['PHONE NUMBER'] && response['PHONE NUMBER'].length > 0) {
          let phoneNumber = response['PHONE NUMBER'][0];
          contact += `Phone number: ${phoneNumber}<br>`;
        }
        if (response['EMAIL'] && response['EMAIL'].length > 0) {
          let email = response['EMAIL'][0];
          contact += `Email: ${email}`;
        }
        if (contact === '') {
          contact = 'No contact information listed.';
        }
        $('#contact-list').html(contact);

      },
      error: function (xhr, status, error) {
        alert('Something went wrong.')
      }
    });
  });
});

$(document).ready(function() {
  $('#downloadJsonResponse').click(function() {

    var formData = new FormData();
    var fileInput = document.getElementById('upload');
    var file = fileInput.files[0];
    var messageTextarea = document.getElementById('message').value.trim();

    if (file) {
      formData.append('upload', file);
    } else if (messageTextarea) {
      formData.append('message', messageTextarea);
    } else {
      alert('Please upload a file or enter text.');
      return;
    }
    
    $.ajax({
      url: '/upload',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data) {
        // Create a Blob with the JSON data
        var blob = new Blob([JSON.stringify(data)], {type: "application/json"});
        // Create an anchor element and trigger a download
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'response.json';
        document.body.appendChild(a); // We need to append the element to the dom -> this is invisible
        a.click(); // simulate click
        document.body.removeChild(a); // remove the element
        URL.revokeObjectURL(url); // release the object URL
      },
      error: function(xhr, status, error) {
        console.error("Error: " + error);
      }
    });
  });
});