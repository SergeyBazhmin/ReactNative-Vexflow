export default class XmlObject {
    constructor(node)
    {
        if (!node || !node.nodeType)
        {
            throw new Error(`The node ${node} is not a valid DOM Node`)
        }
        this.node = node
    }

    getChild(name) {
        return this.node.getElementsByTagName(name)[0]
    }

    getChildren(name = '') {
        return name === '' ? Array.from(this.node.childNodes) : Array.from(this.node.getElementsByTagName(name))
    }

    getSiblings(name){
        return Array.from(this.node.parentNode.getElementsByTagName(name))
    }

    childExists(name) {
        return this.node.getElementsByTagName(name)[0] !== undefined
    }

    getAttribute(name) {
        return this.node.getAttribute(name)
    }

    getText(name) {
        let txt = ''
        if (this.childExists(name)) {
            const kids = this.getChildren(name)
            for(let i = 0; i < kids.length; ++i)
                txt += kids[i].textContent + '\n'
        }
        return txt.trim()
    }

    getNumber(name) {
        let res = NaN
        if (this.childExists(name))
        {
            const kid = this.getChild(name)
            res = parseFloat(kid.textContent)
        }
        return res
    }
}
