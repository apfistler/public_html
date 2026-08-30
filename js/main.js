function init() {

  const menuVisibility =
    document.getElementById("menu_visibility");

  const menu =
    document.getElementById("menu");

  const content =
    document.getElementById("content");


  /*
   * ==========================================================
   * CLOSE OTHER MENU PARENTS
   * ==========================================================
   *
   * Close every parent menu except the specified parent.
   *
   */

  window.closeOtherMenuParents = function (parent) {

    if (!menu) {
      return;
    }

    const parents =
      menu.querySelectorAll(".menu-item.parent");


    parents.forEach(function (otherParent) {

      if (otherParent === parent) {
        return;
      }


      otherParent.classList.remove("active");


      const otherChildMenu =
        otherParent.nextElementSibling;


      if (
        otherChildMenu &&
        otherChildMenu.classList.contains("child-menu")
      ) {

        otherChildMenu.classList.add("hidden");

      }

    });

  };


  /*
   * ==========================================================
   * OPEN MENU PARENT
   * ==========================================================
   *
   * Open the child menu belonging to a parent.
   *
   */

  window.openMenuParent = function (parent) {

    if (!parent) {
      return;
    }


    const childMenu =
      parent.nextElementSibling;


    if (
      !childMenu ||
      !childMenu.classList.contains("child-menu")
    ) {

      return;

    }


    closeOtherMenuParents(parent);


    childMenu.classList.remove("hidden");

    parent.classList.add("active");

  };


  /*
   * ==========================================================
   * TOGGLE MENU PARENT
   * ==========================================================
   *
   * Legacy/manual menu toggle support.
   *
   * This remains available if we ever need it again.
   *
   */

  window.toggleMenuParent = function (parent) {

    if (!parent) {
      return false;
    }


    const childMenu =
      parent.nextElementSibling;


    if (
      !childMenu ||
      !childMenu.classList.contains("child-menu")
    ) {

      return false;

    }


    if (
      !childMenu.classList.contains("hidden")
    ) {

      childMenu.classList.add("hidden");

      parent.classList.remove("active");

      return false;

    }


    openMenuParent(parent);

    return true;

  };


  /*
   * ==========================================================
   * OPEN MENU PARENT FROM URL
   * ==========================================================
   *
   * Parent menu links are now normal URLs.
   *
   * Example:
   *
   *     /html/hypnosis/landing.html#hypnosis
   *
   * After the browser loads the page, use the URL hash to
   * determine which parent menu should be expanded.
   *
   */

  function openMenuParentFromUrl() {

    if (!menu) {
      return;
    }


    const hash =
      window.location.hash;


    if (!hash) {
      return;
    }


    const menuId =
      hash.substring(1);


    if (!menuId) {
      return;
    }


    const parent =
      menu.querySelector(
        '.menu-item.parent[href$="#' +
        CSS.escape(menuId) +
        '"]'
      );


    if (!parent) {
      return;
    }


    openMenuParent(parent);

  };


  /*
   * ==========================================================
   * HIDE MENU
   * ==========================================================
   */

  function hideMenu(saveState = false) {

    if (!menu || !content) {
      return;
    }


    menu.style.display = "none";


    if (menuVisibility) {

      const hamburger =
        menuVisibility.querySelector(
          ".hamburger-icon"
        );

      const closeIcon =
        menuVisibility.querySelector(
          ".close-icon"
        );


      if (hamburger) {
        hamburger.style.display = "inline";
      }


      if (closeIcon) {
        closeIcon.style.display = "none";
      }

    }


    content.classList.add("hidden-menu");

    content.style.marginRight = "0";

    document.body.classList.remove("visible");


    if (saveState) {
      localStorage.setItem("menuState", "collapsed");
    }

  };


  /*
   * ==========================================================
   * SHOW MENU
   * ==========================================================
   */

  function showMenu(saveState = false) {

    if (!menu || !content) {
      return;
    }


    menu.style.display = "block";


    if (menuVisibility) {

      const hamburger =
        menuVisibility.querySelector(
          ".hamburger-icon"
        );

      const closeIcon =
        menuVisibility.querySelector(
          ".close-icon"
        );


      if (hamburger) {
        hamburger.style.display = "none";
      }


      if (closeIcon) {
        closeIcon.style.display = "inline";
      }

    }


    content.classList.remove("hidden-menu");

    content.style.marginRight =
      menu.offsetWidth + "px";

    document.body.classList.add("visible");


    if (saveState) {
      localStorage.setItem("menuState", "expanded");
    }

  };


  /*
   * ==========================================================
   * RESPONSIVE LAYOUT MANAGEMENT
   * ==========================================================
   */

  function handleViewportChange() {

    const savedState =
      localStorage.getItem("menuState");


    if (savedState === "collapsed") {

      hideMenu(false);

    } else if (savedState === "expanded") {

      showMenu(false);

    } else {

      if (window.innerWidth < 1280) {

        hideMenu(false);

      } else {

        showMenu(false);

      }

    }

  };


  /*
   * ==========================================================
   * INITIALIZE MENU
   * ==========================================================
   */

  handleViewportChange();

  openMenuParentFromUrl();


  /*
   * ==========================================================
   * RESPONSIVE RESIZE
   * ==========================================================
   */

  window.addEventListener(
    "resize",
    function () {

      const savedState =
        localStorage.getItem("menuState");


      if (
        savedState === "collapsed" ||
        (window.innerWidth < 1280 && !savedState)
      ) {

        hideMenu(false);

      } else if (
        menu &&
        menu.style.display === "block"
      ) {

        content.style.marginRight =
          menu.offsetWidth + "px";

      }

    }
  );


  /*
   * ==========================================================
   * MENU VISIBILITY BUTTON
   * ==========================================================
   */

  if (menuVisibility) {

    menuVisibility.addEventListener(
      "click",
      function (event) {

        event.preventDefault();


        if (
          !menu ||
          menu.style.display === "none" ||
          menu.style.display === ""
        ) {

          showMenu(true);

        } else {

          hideMenu(true);

        }

      }
    );

  }


  /*
   * ==========================================================
   * MESSAGE BOX
   * ==========================================================
   */

  const messageBox =
    document.querySelector(".message-box");

  const closeButton =
    document.querySelector(".close-btn");


  if (
    messageBox &&
    closeButton
  ) {

    messageBox.style.display = "flex";


    closeButton.addEventListener(
      "click",
      function () {

        messageBox.style.display = "none";

      }
    );

  }

}


document.addEventListener(
  "DOMContentLoaded",
  init
);

/* Add Arrow to Link Lables in Area Page links */

/* Add Arrow to Link Labels in Area Page links */

function highlightActiveAreaPages() {
  // Helper function to extract base file path up through .html (stripping hashes, parameters, etc.)
  function cleanPath(urlStr) {
    try {
      const url = new URL(urlStr, window.location.origin);
      let path = url.pathname;
      
      // Look for .html in the path and strip anything following it
      const htmlIndex = path.toLowerCase().indexOf('.html');
      if (htmlIndex !== -1) {
        path = path.substring(0, htmlIndex + 5); // Includes '.html'
      }
      return path;
    } catch (e) {
      return '';
    }
  }

  const currentCleanPath = cleanPath(window.location.href);

  // Select all links with class area_pages
  const areaLinks = document.querySelectorAll('a.area_pages');

  areaLinks.forEach((link) => {
    // Clean up any existing arrows first
    const existingArrow = link.querySelector('.active-arrow');
    if (existingArrow) {
      existingArrow.remove();
    }

    const href = link.getAttribute('href');
    if (!href) return;

    const linkCleanPath = cleanPath(href);

    // Compare paths up to .html
    if (linkCleanPath && linkCleanPath === currentCleanPath) {
      link.classList.add('active');

      // Create arrow span
      const arrowSpan = document.createElement('span');
      arrowSpan.className = 'active-arrow';
      arrowSpan.innerHTML = '&#8594; '; // Unicode right arrow (→)

      // Insert arrow BEFORE the link text
      link.prepend(arrowSpan);
    } else {
      link.classList.remove('active');
    }
  });
}

// Run on initial page load
document.addEventListener('DOMContentLoaded', highlightActiveAreaPages);

// Also re-run if URL hash changes without a full page reload
window.addEventListener('hashchange', highlightActiveAreaPages);
