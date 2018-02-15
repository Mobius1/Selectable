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

            var mouseUp = new MouseEvent('mouseup', mouseOptions);
            node.dispatchEvent(mouseDown);
            node.dispatchEvent(mouseUp);
        }
        describe('with metaKey', function () {
            var container, selectable;
            beforeEach(function () {
                document.body.innerHTML = '<ul id="selectable"><li>1</li><li>2</li><li>3</li></ul>';

                container = document.getElementById('selectable');
                selectable = new Selectable({
                    appendTo: container,
                    filter: 'li',
                    multiple: true,
                    toggle: false,
                    classes: {
                        selected: "test-selected"
                    }
                });
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
                    multiple: true,
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
    });
});