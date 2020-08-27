/*

//This code grabs the button from popup.html and requests the color value from storage.
//It then applies the color as the background of the button.
 */
<%_ if(features.includes('framework') ) { %>
  <%_ if(useFramework === 'vue' ) { %>
    import Vue from 'vue';
    import App from './App';
    
    new Vue({
      el: '#app',
      render: (h) => h(App)
    });
    
  <% }  %>
  <% } else { %>
    let changeColor = document.getElementById("changeColor") as HTMLElement;
    chrome.storage.sync.get("color", function (data) {
      changeColor.style.backgroundColor = data.color;
      changeColor.setAttribute("value", data.color);
    });
    
    changeColor.onclick = function ({ target }) {
      let color = target.value;
      //permission: "activeTab"
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.executeScript(tabs[0].id, {
          code: 'document.body.style.backgroundColor = "' + color + '";'
        });
      });
    };
  <% } %>

