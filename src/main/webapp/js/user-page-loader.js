/*
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Get ?user=XYZ parameter value
const urlParams = new URLSearchParams(window.location.search);
const parameterUsername = urlParams.get('user');

// URL must include ?user=XYZ parameter. If not, redirect to homepage.
if (!parameterUsername) {
  window.location.replace('/');
}

/** Sets the page title based on the URL parameter username. */
function setPageTitle() {
  document.getElementById('page-title').innerText = parameterUsername;
  document.title = parameterUsername + ' - User Page';
}

/**
 * Shows the message form if the user is logged in.
 */
function showMessageFormIfLoggedIn() {
  fetch('/login-status')
      .then((response) => {
        return response.json();
      })
      .then((loginStatus) => {
        if (loginStatus.isLoggedIn) {
          fetchImageUploadUrlAndShowForm();
          if (loginStatus.username == parameterUsername) {
            var myAvatarElement = document.getElementById('myAvatar');
            myAvatarElement.setAttribute('onclick', 'replaceAvatar()');
            myAvatarElement.style.cursor = 'pointer';
          }
          const messageForm = document.getElementById('message-form');
          // changes the action attribute of the form (ie. the url)
          messageForm.classList.remove('hidden');
          document.getElementById('recipientInput').value = parameterUsername;
        }
      });
}

/**
 * Fetch the images stored for a user if the user is viewing themselves.
 */
function fetchImageUploadUrlAndShowForm() {
  fetch('/image-upload-url')
      .then((response) => {
        return response.text();
      })
      .then((imageUploadUrl) => {
        // Multiple upload urls, split by space.
        var urls = imageUploadUrl.split(/(\s+)/);
        const messageForm = document.getElementById('message-form');
        const avatarForm = document.getElementById('submit-picture');
        messageForm.action = urls[0];
        avatarForm.action = urls[2];
      })
}

/** Fetches messages and add them to the page. */
function fetchMessages() {
  const url = '/messages?user=' + parameterUsername;
  fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((messages) => {
        const messagesContainer = document.getElementById('message-container');
        if (messages.length == 0) {
          messagesContainer.innerHTML = '<p>This user has no posts yet.</p>';
        } else {
          messagesContainer.innerHTML = '';
        }
        messages.forEach((message) => {
          const messageDiv = buildMessageDiv(message);
          messagesContainer.appendChild(messageDiv);
        });
      });
}

/**
 * Builds an element that displays the message.
 * @param {Message} message
 * @return {Element}
 */
function buildMessageDiv(message) {
  const headerDiv = document.createElement('div');
  headerDiv.classList.add('message-header');
  headerDiv.appendChild(document.createTextNode(
      message.user + ' - ' + new Date(message.timestamp)));

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('message-body');
  bodyDiv.innerHTML = message.text;
  if (message.imageUrl) {
    bodyDiv.innerHTML += '<br/> <img src="' + message.imageUrl + '" />';
  }

  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message-div');
  messageDiv.appendChild(headerDiv);
  messageDiv.appendChild(bodyDiv);

  return messageDiv;
}

function fetchProfile() {
  const url = '/profile?user=' + parameterUsername;
  fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((profile) => {
        if (profile && profile.avatarUrl) {
          document.getElementById('myAvatar').setAttribute('src', profile.avatarUrl);
        }
      });
}

/**
 * Allows user to click on profile picture to change it.
 */
function replaceAvatar() {
  var avatarElement = document.getElementById('updateAvatar');
  avatarElement.click();
}

/** Fetches data and populates the UI of the page. */
function buildUI() {
  addLoginOrLogoutLinkToNavigation();
  fetchProfile();
  setPageTitle();
  showMessageFormIfLoggedIn();
  fetchMessages();
  var avatarElement = document.getElementById('updateAvatar');
  avatarElement.onchange = function() {
    if (this.value == "") {
      // Shouldn't ever happen but just in case
    } else {
      var submitElement = document.getElementById('submit-picture');
      submitElement.submit();
    }
  };
}
