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

    //Sticky sidebar
    $('.leftSidebar, .content, .rightSidebar')
            .theiaStickySidebar({
                additionalMarginTop: 111
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


document.addEventListener("DOMContentLoaded", init);

function init() {
    createNavLinks();
    initSidebar();


    const versions = document.querySelector(".sidebar-header").children[1].lastElementChild;
    const menuOverview = sidebarMenu.children[1].lastElementChild;
    const menuOptions = sidebarMenu.lastElementChild.lastElementChild.children[0].lastElementChild;
    const menuMethods = sidebarMenu.lastElementChild.lastElementChild.children[1].lastElementChild;
    let menuEvents = sidebarMenu.lastElementChild.lastElementChild.children[2].lastElementChild;

    if ( menuEvents.nodeName !== "UL" ) {
        const ul = document.createElement("ul");
        sidebarMenu.lastElementChild.lastElementChild.children[2].appendChild(ul);
        menuEvents = ul;
    }

    versions.previousElementSibling.textContent = "v0.13.3";

    versions.innerHTML = `  <div>Versions</div>
                            <a class="dropdown-item active" href="#">latest</a>
                            <a class="dropdown-item" href="#">stable</a>
                            <a class="dropdown-item" href="#">v0.13.2</a>
                            <a class="dropdown-item" href="#">v0.13.1</a>
                            <a class="dropdown-item" href="#">v0.13.0</a>
                            <a class="dropdown-item" href="#">v0.12.3</a>
                            <a class="dropdown-item" href="#">v0.12.2</a>
                            <a class="dropdown-item" href="#">v0.12.1</a>
                            <a class="dropdown-item" href="#">v0.12.0</a>
                            <a class="dropdown-item" href="#">v0.11.0</a>
                            <a class="dropdown-item" href="#">v0.10.9</a>
                            <a class="dropdown-item" href="#">master</a>`;

    menuOverview.innerHTML = `<li><a href="https://mobius1.github.io/Selectable/index.html">Introduction</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/getting-started.html">Getting Started</a></li>`;

    menuOptions.innerHTML = `<li><a href="https://mobius1.github.io/Selectable/api/options/filter.html">filter</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/options/appendTo.html">appendTo</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/options/tolerance.html">tolerance</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/options/ignore.html">ignore</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/options/toggle.html">toggle</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/options/throttle.html">throttle</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/options/autoScroll.html">autoScroll</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/options/autoRefresh.html">autoRefresh</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/options/lasso.html">lasso</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/options/classes.html">classes</a></li>`;


    menuMethods.innerHTML = `<li><a href="https://mobius1.github.io/Selectable/api/methods/destroy.html">destroy()</a></li>
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

    menuEvents.innerHTML = `<li><a href="https://mobius1.github.io/Selectable/api/events/selectable.init.html">selectable.init</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/events/selectable.start.html">selectable.start</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/events/selectable.drag.html">selectable.drag</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/events/selectable.end.html">selectable.end</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/events/selectable.select.html">selectable.select</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/events/selectable.unselect.html">selectable.unselect</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/events/selectable.update.html">selectable.update</a></li>
                            <li><a href="https://mobius1.github.io/Selectable/api/events/selectable.recalculate.html">selectable.recalculate</a></li>`;

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
}

function toggleMenu(e) {
    const a = e.target.closest(".has-arrow");

    if ( a ) {
        e.preventDefault();
        const li = e.target.closest("li");
        li.classList.toggle("open");
    }
}

function createNavLinks() {
    const titles = document.querySelectorAll(".scroll-title");
    const frag = document.createDocumentFragment();

    titles.forEach(title => {
        const li = document.createElement("li");
        li.className = "toc-entry";
        li.innerHTML = `<a class="js-scroll-trigger" href="#${title.id}">${title.textContent}</a>`;

        frag.appendChild(li);
    });

    document.getElementById("section-nav").appendChild(frag);    
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
