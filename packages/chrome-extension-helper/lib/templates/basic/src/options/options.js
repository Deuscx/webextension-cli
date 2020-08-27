
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
    let page = document.getElementById("buttonDiv") as HTMLElement;
    const kButtonColors = ["#3aa757", "#e8453c", "#f9bb2d", "#4688f1"];
    function constructOptions(kButtonColors: string[]) {
      for (let item of kButtonColors) {
        let button = document.createElement("button");
        button.style.backgroundColor = item;
        button.addEventListener("click", function () {
          chrome.storage.sync.set({ color: item }, function () {
            console.log("color is " + item);
          });
        });
        page.appendChild(button);
      }
    }
    constructOptions(kButtonColors);
  <% } %>

