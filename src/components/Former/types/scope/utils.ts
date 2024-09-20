
export default class Utils {

    public static insertTextAtCursor(text) {
        const sel: any = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            // Move the cursor to the end of the inserted text
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
    public static setCursorPosition(containerEl, position) {
        let doc = containerEl.ownerDocument;
        let win = doc.defaultView;
        let range = doc.createRange();
        let sel = win.getSelection();

        // 获取容器内的所有节点
        let charIndex = 0, nodeStack = [containerEl], node, foundStart = false;
        while (!foundStart && (node = nodeStack.pop())) {
            if (node.nodeType == 3) { // Text node
                let nextCharIndex = charIndex + node.length;
                if (position >= charIndex && position <= nextCharIndex) {
                    range.setStart(node, position - charIndex);
                    range.collapse(true);
                    foundStart = true;
                }
                charIndex = nextCharIndex;
            } else {
                let i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }

        sel.removeAllRanges();
        sel.addRange(range);
    }
    public static getSursorRange(containerEl: any) {
        let doc = containerEl.ownerDocument || containerEl.document;
        let win = doc.defaultView || doc.parentWindow;
        let sel = win.getSelection();
        let cursorPos = 0;
        
        var selectedText = sel.toString();
        var selectionLength = selectedText.length;
        if (sel.rangeCount > 0) {
            let range = sel.getRangeAt(0);
            let preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(containerEl);
            preCaretRange.setEnd(range.startContainer, range.startOffset);
            cursorPos = preCaretRange.toString().length;
        }
        return {
            start: cursorPos,
            end: selectionLength + cursorPos,
            length: selectionLength
        };
    }
    public static getCursorPosition(containerEl: any) {
        if (containerEl) {
            let doc = containerEl.ownerDocument || containerEl.document;
            let win = doc.defaultView || doc.parentWindow;
            let sel = win.getSelection();
            
            if (sel.rangeCount > 0) {
                let range = sel.getRangeAt(0);
                let preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(containerEl);
                preCaretRange.setEnd(range.startContainer, range.startOffset);
                let cursorPos = preCaretRange.toString().length;
                return cursorPos;
            }
        }
        return 0;
    }
}