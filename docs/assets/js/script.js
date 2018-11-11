/* global hljs */

$(document).ready(function () {
    "use strict";
    //page loader
    Pace.on("done", function () {
        //console.log("finished");
        // $('.loader').fadeIn(1500);
    });

    //navbar add remove calss
    var header = $(".no-background");
    $(window).on('scroll', function () {
        var scroll = $(window).scrollTop();
        if (scroll >= 1) {
            header.removeClass('no-background').addClass("navbar-bg");
        } else {
            header.removeClass("navbar-bg").addClass('no-background');
        }
    });

    //multi dropdown
    $('.dropdown-menu a.dropdown-toggle').on('click', function (e) {
        var $el = $(this);
        var $parent = $(this).offsetParent(".dropdown-menu");
        if (!$(this).next().hasClass('show')) {
            $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
        }
        var $subMenu = $(this).next(".dropdown-menu");
        $subMenu.toggleClass('show');

        $(this).parent("li").toggleClass('show');

        $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
            $('.dropdown-menu .show').removeClass("show");
        });

        if (!$parent.parent().hasClass('navbar-nav')) {
            $el.next().css({"top": $el[0].offsetTop, "left": $parent.outerWidth() - 4});
        }

        return false;
    });

    $('.faqLeftSidebar, .faqContent').theiaStickySidebar();

    //Language dropdown
    $("#lng_select").msDropdown();

    //Navbar top search
    $(".navbar").each(function () {
        $("li.search > a", this).on("click", function (e) {
            e.preventDefault();
            $(".top-search").slideToggle();
        });
    });
    $(".input-group-addon.close-search").on("click", function () {
        $(".top-search").slideUp();
    });




});

const sidebarMenu = document.getElementById("sidebarMenu");
let bar = false;

document.addEventListener("DOMContentLoaded", init);

function init() {
    createNavLinks();
    initSidebar();


    const parentMenu = sidebarMenu.lastElementChild.lastElementChild;

    const propsMenu = document.createElement("li");
    propsMenu.innerHTML = `<a href="#" class="has-arrow">Properties</a><ul></ul>`;
    parentMenu.insertBefore(propsMenu, parentMenu.children[1]);

    const versions = document.querySelector(".sidebar-header").children[1].lastElementChild;
    const menuOverview = sidebarMenu.children[1];
    const menuOptions = parentMenu.children[0];
    const menuMethods = parentMenu.children[2];
    let menuEvents = parentMenu.children[3];

    if ( menuMethods.lastElementChild.nodeName !== "UL" ) {
        const ul = document.createElement("ul");
        menuMethods.appendChild(ul);
    }    

    if ( menuOptions.lastElementChild.nodeName !== "UL" ) {
        const ul = document.createElement("ul");
        menuOptions.appendChild(ul);
    }

    if ( menuEvents.lastElementChild.nodeName !== "UL" ) {
        const ul = document.createElement("ul");
        menuEvents.appendChild(ul);
    }

    fetch("https://api.github.com/repos/Mobius1/Selectable/releases").then(resp => resp.json()).then(json => {

        versions.previousElementSibling.textContent = json[0].name;

        const frag = document.createDocumentFragment();
        json.slice(0,10).forEach((item,i) => {
            const a = document.createElement("a");
            a.className = "dropdown-item";
            a.href = item.html_url;
            a.textContent = i < 1 ? "latest" : item.name;

            if ( i < 1 ) {
                a.classList.add("active");
            }

            frag.appendChild(a);
        });
        versions.innerHTML = "";
        versions.appendChild(frag);
    });


    menuOverview.lastElementChild.innerHTML = `<li><a href="https://mobius1.github.io/Selectable/index.html">Introduction</a></li>
                                              <li><a href="https://mobius1.github.io/Selectable/getting-started.html">Getting Started</a></li>`;

    menuOptions.lastElementChild.innerHTML = `<li><a href="https://mobius1.github.io/Selectable/api/options/filter.html">filter</a></li>
                                                <li><a href="https://mobius1.github.io/Selectable/api/options/appendTo.html">appendTo</a></li>
                                                <li><a href="https://mobius1.github.io/Selectable/api/options/tolerance.html">tolerance</a></li>
                                                <li><a href="https://mobius1.github.io/Selectable/api/options/ignore.html">ignore</a></li>
                                                <li><a href="https://mobius1.github.io/Selectable/api/options/toggle.html">toggle</a></li>
                                                <li><a href="https://mobius1.github.io/Selectable/api/options/throttle.html">throttle</a></li>
                                                <li><a href="https://mobius1.github.io/Selectable/api/options/autoScroll.html">autoScroll</a></li>
                                                <li><a href="https://mobius1.github.io/Selectable/api/options/autoRefresh.html">autoRefresh</a></li>
                                                <li><a href="https://mobius1.github.io/Selectable/api/options/lasso.html">lasso</a></li>
                                                <li><a href="https://mobius1.github.io/Selectable/api/options/classes.html">classes</a></li>`;

    propsMenu.lastElementChild.innerHTML = `<li><a href="https://mobius1.github.io/Selectable/api/properties/autoscroll.html>autoscroll</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/properties/bodyContainer.html>bodyContainer</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/properties/cmdDown.html>cmdDown</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/properties/config.html>config</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/properties/container.html>container</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/properties/enabled.html>enabled</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/properties/events.html>events</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/properties/items.html>items</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/properties/lasso.html>lasso</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/properties/listeners.html>listeners</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/properties/nodes.html>nodes</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/properties/rect.html>rect</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/properties/scroll.html>scroll</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/properties/shiftDown.html>shiftDown</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/properties/version.html>version</a></li>`;


    menuMethods.lastElementChild.innerHTML = `<li><a href="https://mobius1.github.io/Selectable/api/methods/destroy.html">destroy()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/init.html">init()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/disable.html">disable()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/enable.html">enable()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/select.html">select()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/unselect.html">unselect()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/selectAll.html">selectAll()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/invert.html">invert()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/clear.html">clear()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/add.html">add()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/remove.html">remove()</a></li> 
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/update.html">update()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/recalculate.html">recalculate()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/on.html">on()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/off.html">off()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/get.html">get()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/getItems.html">getItems()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/getNodes.html">getNodes()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/getSelectedItems.html">getSelectedItems()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/getSelectedNodes.html">getSelectedNodes()</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/methods/setContainer.html">setContainer()</a></li>`;

    menuEvents.lastElementChild.innerHTML = `<li><a href="https://mobius1.github.io/Selectable/api/events/selectable.init.html">selectable.init</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/events/selectable.start.html">selectable.start</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/events/selectable.drag.html">selectable.drag</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/events/selectable.end.html">selectable.end</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/events/selectable.select.html">selectable.select</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/events/selectable.unselect.html">selectable.unselect</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/events/selectable.update.html">selectable.update</a></li>
                                            <li><a href="https://mobius1.github.io/Selectable/api/events/selectable.recalculate.html">selectable.recalculate</a></li>`;

    if ( !menuOptions.firstElementChild.classList.contains("has-arrow") ) {
        menuOptions.firstElementChild.classList.add("has-arrow");
    }

    if ( !menuMethods.firstElementChild.classList.contains("has-arrow") ) {
        menuMethods.firstElementChild.classList.add("has-arrow");
    }

    if ( !menuEvents.firstElementChild.classList.contains("has-arrow") ) {
        menuEvents.firstElementChild.classList.add("has-arrow");
    }

    const activeBreadcrumb = document.querySelector(".breadcrumb-item.active");

    if ( activeBreadcrumb ) {
        const items = sidebarMenu.querySelectorAll("li");

        items.forEach(item => {
            const link = item.querySelector("a");
            const match = link.textContent === activeBreadcrumb.textContent;
            if (match) {
                document.head.getElementsByTagName("title")[0].textContent = `Selectable - ${link.textContent}`;

                items.forEach(el => {
                    el.classList.toggle("open", el.contains(link));
                });
            }
            item.classList.toggle("active", match);
        });
    }

    if ( window.Selectable && typeof Selectable === "function" ) {
        demo1();
        demo2();
        demo3();
    }
}

function initSidebar() {
    sidebarMenu.addEventListener("click", toggleMenu, false);
    initBar();
    initSearch();
}

function initBar() {
    const link = document.createElement("link");
    link.href = "https://unpkg.com/minibarjs@latest/dist/minibar.min.css";
    link.rel = "stylesheet";
    link.type = "text/css";

    document.head.appendChild(link);
    document.head.insertBefore(link, document.head.querySelector("link"));

    const script = document.createElement("script");
    script.src = "https://unpkg.com/minibarjs@latest/dist/minibar.min.js";
    script.type ="text/javascript";

    document.body.insertBefore(script, document.body.querySelector("script"));

    script.async = true;
    script.onload = function(){
        bar = new MiniBar(sidebarMenu);

        document.querySelectorAll(".output").forEach(el => {
            new MiniBar(el, {
                alwaysShowBars: true
            });
        });
    };    
}

function toggleMenu(e) {
    const a = e.target.closest(".has-arrow");

    if ( a ) {
        e.preventDefault();
        const li = e.target.closest("li");
        li.classList.toggle("open");

        if ( bar ) {
            bar.update();
        }        
    }
}

function createNavLinks() {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.4.2/tocbot.min.js";
    script.type ="text/javascript";

    document.body.insertBefore(script, document.body.querySelector("script"));

    script.async = true;
    script.onload = function(){
        tocbot.init({
          // Where to render the table of contents.
          tocSelector: '#section-nav',
          // Where to grab the headings to build the table of contents.
          contentSelector: '.content-wrapper',
          // Which headings to grab inside of the contentSelector element.
          headingSelector: 'h3, h4, h5, h6',
          // listClass: '',
          listItemClass: 'toc-entry',
        });
    };  

    let ticking = false;
    const stickyNav = document.getElementById("section-nav");
    window.addEventListener('scroll', function(e) {
        scrollPos = window.pageYOffset || document.documentElement.scrollTop;
        if (!ticking) {
            requestAnimationFrame(function() {
                dockHeader();
                ticking = false;
            });
        }
        ticking = true;
    });

    function dockHeader() {
        var scrollY = window.scrollY;
        if ( scrollY > 0 ) {
            stickyNav.classList.add('docked');
        } else {
            stickyNav.classList.remove('docked');
        }
    }
}


if ( window.Selectable && typeof Selectable === "function" ) {

    const container1 = document.getElementById("demo-container");
    const container2 = document.getElementById("demo-container-2");
    const container3 = document.querySelector(".desktop");
    let selectable1;
    let selectable2;
    let selectable3;

    function demo1() {
        if ( container1 ) {

            selectable1 = new Selectable({
                filter: ".btn-selectable",
                appendTo: container1,
                lasso: {
                    borderColor: "#fff"
                }
            });

            const frag = document.createDocumentFragment();

            for (let i = 0; i < 36; i++ ) {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "btn btn-secondary mr-2 mb-2 btn-selectable";   
                button.textContent = i+1;         
                frag.appendChild(button);
            }

            container1.appendChild(frag);

            selectable1.add(container1.children);
        }
    }

    function demo2() {
        if ( container2 ) {
            selectable2 = new Selectable({
                appendTo: container2,
                lasso: {
                    borderColor: "#fff",
                    backgroundColor: "rgba(255,255,255,0.2)"
                }            
            });

            const frag = document.createDocumentFragment();

            for (let i = 0; i < 9; i++ ) {
                const div = document.createElement("div");
                div.className = "ui-thumbnail";
                div.innerHTML = `<img src="assets/img/avatar-${i+1}.png" alt="..." class="img-thumbnail">`;
                frag.appendChild(div);
            }

            container2.appendChild(frag);

            selectable2.add(container2.children);
        }
    }

    function demo3() {
        if ( container3 ) {
            new Selectable({
              filter: ".icon-desktop",
              appendTo: container3,
              lasso: {
                border: "1px solid rgba(51, 153, 255, 1)",
                backgroundColor: "rgba(51, 153, 255, 0.2)"
              },
            });
        }    
    }
}

function initSearch() {
    const old = document.querySelector(".has-search");
    const template = `<form class="form-group has-search" action="https://mobius1.github.io/Selectable/search.html">
                        <span class="ti-search form-control-feedback"></span>
                        <input type="text" class="form-control" placeholder="Search docs ..." name="q">
                     </form>`;
    const div = document.createElement("div");
    div.innerHTML = template;

    old.parentNode.replaceChild(div.firstElementChild, old);
}