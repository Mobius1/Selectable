describe('selectable', function () {
    beforeEach(function () {

    });
    afterEach(function () {
        document.body.innerHTML = '';
    });

    describe('Mouse behaviour', function () {
        function clickNode(node, metaKey, shiftKey) {
            var mouseOptions = {
                metaKey: !!metaKey,
                shiftKey: !!shiftKey,
                bubbles: true
            };
            var mouseDown = new MouseEvent('mousedown', mouseOptions);
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