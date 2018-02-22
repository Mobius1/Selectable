describe('selectable', function () {
    beforeEach(function () {

    });
    afterEach(function () {
        document.body.innerHTML = '';
    });
    //copied from selectable.js, should be kept in sync!
    function rect(e) {
        var w = window,
            o = e.getBoundingClientRect(),
            b = document.documentElement || document.body.parentNode || document.body,
            d = (void 0 !== w.pageXOffset) ? w.pageXOffset : b.scrollLeft,
            n = (void 0 !== w.pageYOffset) ? w.pageYOffset : b.scrollTop;
        return {
            x1: o.left + d,
            x2: o.left + o.width + d,
            y1: o.top + n,
            y2: o.top + o.height + n,
            height: o.height,
            width: o.width
        };
    }
    function buildMouseOptions(node, metaKey, shiftKey){
        var box = rect(node);

        return {
            metaKey: !!metaKey,
            shiftKey: !!shiftKey,
            bubbles: true,
            clientX: box.x1+((box.width)/2),
            clientY: box.y1+((box.height)/2)
        };
    }

    describe('Mouse behaviour', function () {
        function clickNode(node, metaKey, shiftKey) {
            var mouseOptions = buildMouseOptions(node, metaKey, shiftKey),
                mouseDown = new MouseEvent('mousedown', mouseOptions);
            spyOn(mouseDown, 'preventDefault');
            mouseDown.preventDefault.and.callThrough();
            var mouseUp = new MouseEvent('mouseup', mouseOptions);
            spyOn(mouseUp, 'preventDefault');
            mouseUp.preventDefault.and.callThrough();
            node.dispatchEvent(mouseDown);
            node.dispatchEvent(mouseUp);
            return {
                mouseDown: mouseDown,
                mouseUp: mouseUp
            };
        }
        function lassoStart(node, metaKey, shiftKey) {
            var mouseOptions = buildMouseOptions(node, metaKey, shiftKey),
                mouseDown = new MouseEvent('mousedown', mouseOptions);
            spyOn(mouseDown, 'preventDefault');
            mouseDown.preventDefault.and.callThrough();
            node.dispatchEvent(mouseDown);
            return {
                mouseDown: mouseDown
            };
        }
        function lassoEnd(node, metaKey, shiftKey) {
            var mouseOptions = buildMouseOptions(node, metaKey, shiftKey),
                mouseUp = new MouseEvent('mouseup', mouseOptions);
            spyOn(mouseUp, 'preventDefault');
            mouseUp.preventDefault.and.callThrough();
            node.dispatchEvent(mouseUp);
            return {
                mouseUp: mouseUp
            };
        }
        function moveToNode(node, metaKey, shiftKey) {
            var mouseOptions = buildMouseOptions(node, metaKey, shiftKey),
                mouseMove = new MouseEvent('mousemove', mouseOptions);
            spyOn(mouseMove, 'preventDefault');
            mouseMove.preventDefault.and.callThrough();
            node.dispatchEvent(mouseMove);

            return {
                mouseMove: mouseMove
            };
        }

        describe('with metaKey', function () {
            var container, selectable;
            beforeEach(function () {
                document.body.innerHTML = '<ul id="selectable"><li>1</li><li>2</li><li>3</li></ul>';

                container = document.getElementById('selectable');
                selectable = new Selectable({
                    appendTo: container,
                    filter: 'li',
                    toggle: false,
                    classes: {
                        selected: "test-selected"
                    }
                });
            });

            afterEach(function () {
                selectable.unbind();
            });

            it('adds another element to the selection', function () {
                clickNode(container.firstChild, true);

                expect(container.firstChild.getAttribute('class')).toContain('test-selected');

                clickNode(container.lastChild, true);
                expect(container.lastChild.getAttribute('class')).toContain('test-selected');

                var centerChild = container.children[1];
                expect(centerChild).not.toContain('test-selected');
            });

            it('removes another element from the selection', function () {
                clickNode(container.firstChild, true);
                clickNode(container.lastChild, true);
                expect(container.lastChild.getAttribute('class')).toContain('test-selected');

                clickNode(container.lastChild, true);
                expect(container.lastChild.getAttribute('class')).not.toContain('test-selected');
                expect(container.firstChild.getAttribute('class')).toContain('test-selected');
            });
        });

        describe('with shiftKey', function () {
            var container, selectable;
            beforeEach(function () {
                document.body.innerHTML = '<ul id="selectable"><li>1</li><li>2</li><li>3</li></ul>';

                container = document.getElementById('selectable');
                selectable = new Selectable({
                    appendTo: container,
                    filter: 'li',
                    toggle: false,
                    classes: {
                        selected: "test-selected"
                    }
                });
            });
            afterEach(function () {
                selectable.unbind();
            });

            it('first time click only selects that node', function () {
                clickNode(container.lastChild, false, true);
                expect(container.lastChild.getAttribute('class')).toContain('test-selected');
                expect(container.firstChild.getAttribute('class')).not.toContain('test-selected');
                expect(container.children[1].getAttribute('class')).not.toContain('test-selected');
            });

            it('selects all rows forward', function () {
                clickNode(container.firstChild, false, false);
                clickNode(container.lastChild, false, true);
                expect(container.lastChild.getAttribute('class')).toContain('test-selected');
                expect(container.firstChild.getAttribute('class')).toContain('test-selected');
                expect(container.children[1].getAttribute('class')).toContain('test-selected');
            });

            it('selects all rows reverse', function () {
                clickNode(container.lastChild, false, false);
                clickNode(container.firstChild, false, true);
                expect(container.lastChild.getAttribute('class')).toContain('test-selected');
                expect(container.firstChild.getAttribute('class')).toContain('test-selected');
                expect(container.children[1].getAttribute('class')).toContain('test-selected');
            });
        });

        describe('Form element behaviour', function () {
            var container, selectable;
            beforeEach(function () {
                document.body.innerHTML = '<ul id="selectable">' +
                    '<li><input id="input"/></li>' +
                    '<li><select id="select"><option id="option">1</option><option>2</option></select></li>' +
                    '<li><button id="button">3</button></li>' +
                    '<li><textarea id="textarea">3</textarea></li>' +
                '</ul>';

                container = document.getElementById('selectable');
                selectable = new Selectable({
                    appendTo: container,
                    filter: 'li',
                    toggle: false,
                    classes: {
                        selected: "test-selected"
                    }
                });
            });
            afterEach(function () {
                selectable.unbind();
            });
            it('does not prevent default behaviour when `input` field is clicked', function () {
                var input = document.getElementById('input'),
                    events = clickNode(input, false, false);
                expect(container.children[0].getAttribute('class')).toContain('test-selected');
                expect(events.mouseDown.preventDefault).not.toHaveBeenCalled();
            });
            it('does not prevent default behaviour when `select` field is clicked', function () {
                var select = document.getElementById('select'),
                    events = clickNode(select, false, false);
                expect(container.children[1].getAttribute('class')).toContain('test-selected');
                expect(events.mouseDown.preventDefault).not.toHaveBeenCalled();
            });
            it('does not prevent default behaviour when `option` is clicked', function () {
                var option = document.getElementById('option'),
                    events = clickNode(option, false, false);
                expect(container.children[1].getAttribute('class')).toContain('test-selected');
                expect(events.mouseDown.preventDefault).not.toHaveBeenCalled();
            });
            it('does not prevent default behaviour when `button` is clicked', function () {
                var button = document.getElementById('button'),
                    events = clickNode(button, false, false);
                expect(container.children[2].getAttribute('class')).toContain('test-selected');
                expect(events.mouseDown.preventDefault).not.toHaveBeenCalled();
            });
            it('does not prevent default behaviour when `textarea` is clicked', function () {
                var textarea = document.getElementById('textarea'),
                    events = clickNode(textarea, false, false);
                expect(container.children[3].getAttribute('class')).toContain('test-selected');
                expect(events.mouseDown.preventDefault).not.toHaveBeenCalled();
            });
        });

        describe('Toggle', function () {
            var container, selectable;
            beforeEach(function () {
                document.body.innerHTML = '<ul id="selectable"><li>1</li><li>2</li><li>3</li></ul>';

                container = document.getElementById('selectable');
            });
            describe('toggle on', function () {
                beforeEach(function () {
                    selectable = new Selectable({
                        appendTo: container,
                        filter: 'li',
                        toggle: true,
                        classes: {
                            selected: "test-selected"
                        }
                    });
                });
                it('selections are deselected', function () {
                    clickNode(container.firstChild, false, false);
                    expect(container.firstChild.getAttribute('class')).toContain('test-selected');
                    clickNode(container.firstChild, false, false);
                    expect(container.firstChild.getAttribute('class')).not.toContain('test-selected');
                });

                it('new selections are added', function () {
                    clickNode(container.firstChild, false, false);
                    expect(container.firstChild.getAttribute('class')).toContain('test-selected');
                    clickNode(container.lastChild, false, false);
                    expect(container.firstChild.getAttribute('class')).toContain('test-selected');
                    expect(container.lastChild.getAttribute('class')).toContain('test-selected');
                });
            });

            describe('toggle off', function () {
                beforeEach(function () {
                    selectable = new Selectable({
                        appendTo: container,
                        filter: 'li',
                        toggle: false,
                        classes: {
                            selected: "test-selected"
                        }
                    });
                });
                it('selections are not deselected', function () {

                    clickNode(container.firstChild, false, false);
                    expect(container.firstChild.getAttribute('class')).toContain('test-selected');
                    clickNode(container.firstChild, false, false);
                    expect(container.firstChild.getAttribute('class')).toContain('test-selected');
                });

                it('does not maintain previous selection', function () {
                    clickNode(container.firstChild);
                    expect(container.firstChild.getAttribute('class')).toContain('test-selected');

                    clickNode(container.lastChild);
                    expect(container.firstChild.getAttribute('class')).not.toContain('test-selected');
                    expect(container.lastChild.getAttribute('class')).toContain('test-selected');
                });
            });
        });

        describe('Lasso', function () {
            var container, selectable;
            beforeEach(function () {
                document.body.innerHTML = '<ul id="selectable"><li>1</li><li>2</li><li>3</li></ul>';

                container = document.getElementById('selectable');
            });

            describe('Lasso enabled', function () {
                beforeEach(function () {
                    selectable = new Selectable({
                        appendTo: container,
                        filter: 'li',
                        toggle: false,
                        classes: {
                            selected: "test-selected",
                            selecting: "test-selecting"
                        }
                    });
                });

                it('selected all elements moved over by the lasso', function () {
                    lassoStart(container.children[0]);
                    var firstNodeExpectation = expect(container.children[0].getAttribute('class')),
                        secondNodeExpectation = expect(container.children[1].getAttribute('class')),
                        lastNodeExpectation = expect(container.children[2].getAttribute('class'));
                    firstNodeExpectation.toContain('test-selecting');
                    firstNodeExpectation.not.toContain('test-selected');
                    secondNodeExpectation.not.toContain('test-selected');
                    secondNodeExpectation.not.toContain('test-selecting');
                    lastNodeExpectation.not.toContain('test-selected');
                    lastNodeExpectation.not.toContain('test-selecting');

                    moveToNode(container.children[1]);
                    firstNodeExpectation = expect(container.children[0].getAttribute('class'));
                    secondNodeExpectation = expect(container.children[1].getAttribute('class'));
                    lastNodeExpectation = expect(container.children[2].getAttribute('class'));
                    firstNodeExpectation.toContain('test-selecting');
                    secondNodeExpectation.toContain('test-selecting');
                    lastNodeExpectation.not.toContain('test-selecting');

                    moveToNode(container.children[2]);
                    firstNodeExpectation = expect(container.children[0].getAttribute('class'));
                    secondNodeExpectation = expect(container.children[1].getAttribute('class'));
                    lastNodeExpectation = expect(container.children[2].getAttribute('class'));
                    firstNodeExpectation.toContain('test-selecting');
                    firstNodeExpectation.not.toContain('test-selected');
                    secondNodeExpectation.toContain('test-selecting');
                    secondNodeExpectation.not.toContain('test-selected');
                    lastNodeExpectation.toContain('test-selecting');
                    lastNodeExpectation.not.toContain('test-selected');

                });
            });

            describe('Lasso disabled', function () {
                beforeEach(function () {
                    selectable = new Selectable({
                        appendTo: container,
                        filter: 'li',
                        toggle: false,
                        lasso: false,
                        classes: {
                            selected: "test-selected",
                            selecting: "test-selecting"
                        }
                    });
                });

                it('moved over elements are not selected', function () {
                    lassoStart(container.children[0]);
                    var firstNodeExpectation = expect(container.children[0].getAttribute('class')),
                        secondNodeExpectation = expect(container.children[1].getAttribute('class')),
                        lastNodeExpectation = expect(container.children[2].getAttribute('class'));
                    firstNodeExpectation.toContain('test-selecting');
                    firstNodeExpectation.not.toContain('test-selected');
                    secondNodeExpectation.not.toContain('test-selected');
                    secondNodeExpectation.not.toContain('test-selecting');
                    lastNodeExpectation.not.toContain('test-selected');
                    lastNodeExpectation.not.toContain('test-selecting');

                    moveToNode(container.children[1]);
                    firstNodeExpectation = expect(container.children[0].getAttribute('class'));
                    secondNodeExpectation = expect(container.children[1].getAttribute('class'));
                    lastNodeExpectation = expect(container.children[2].getAttribute('class'));
                    firstNodeExpectation.toContain('test-selecting');
                    secondNodeExpectation.not.toContain('test-selecting');
                    lastNodeExpectation.not.toContain('test-selecting');

                    moveToNode(container.children[2]);
                    firstNodeExpectation = expect(container.children[0].getAttribute('class'));
                    secondNodeExpectation = expect(container.children[1].getAttribute('class'));
                    lastNodeExpectation = expect(container.children[2].getAttribute('class'));
                    firstNodeExpectation.toContain('test-selecting');
                    firstNodeExpectation.not.toContain('test-selected');
                    secondNodeExpectation.not.toContain('test-selecting');
                    secondNodeExpectation.not.toContain('test-selected');
                    lastNodeExpectation.not.toContain('test-selecting');
                    lastNodeExpectation.not.toContain('test-selected');
                });
            });
        });
    });

    describe('keyboard shortcuts', function () {
        var container, selectable;
        beforeEach(function () {
            document.body.innerHTML = '<ul id="selectable"><li>1</li><li>2</li><li>3</li></ul>';

            container = document.getElementById('selectable');
            selectable = new Selectable({
                appendTo: container,
                filter: 'li',
                toggle: false,
                classes: {
                    selected: "test-selected"
                }
            });
        });
        afterEach(function () {
            selectable.unbind();
        });
        describe('select all', function () {
            it('selects all rows if none are selected', function () {
                var selectAll = new KeyboardEvent('keydown', {
                    bubbles: true,
                    code: 65, // = a
                    metaKey: true
                });
                document.dispatchEvent(selectAll);
                expect(container.lastChild.getAttribute('class')).toContain('test-selected');
                expect(container.firstChild.getAttribute('class')).toContain('test-selected');
                expect(container.children[1].getAttribute('class')).toContain('test-selected');
            });
        });
    });
});