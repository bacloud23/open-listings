import Grid from 'tui-grid' /* ES6 */
class CustomTextEditor {
    constructor(props) {
        const el = document.createElement('textarea')

        el.value = String(props.value).replace(/<br>/g, '\n')

        this.el = el
    }

    getValue() {
        return this.el.value.replace(/\n/g, '<br>')
    }
    //...
}

/** @type  import('../../../node_modules/tui-grid/types/index.js').ExportOptions */
const exportOptions = {}

/** @type  import('../../../node_modules/tui-grid/types/index.js').GridOptions */
const options = {
    contextMenu: false,
    usageStatistics: false,
    el: document.getElementById('grid'),
    data: {
        api: {
            readData: { url: '/admin/', method: 'GET' },
            // createData: { url: '/admin/', method: 'POST' },
            updateData: { url: '/admin/', method: 'PUT' },
            // modifyData: { url: '/admin/', method: 'PUT' },
            // deleteData: { url: '/admin/', method: 'DELETE' },
        },
        contentType: 'application/json;charset=UTF-8',
    },
    scrollX: false,
    scrollY: false,
    minBodyHeight: 30,
    rowHeight: 'auto',
    rowHeaders: ['rowNum'],
    pageOptions: {
        useClient: true,
        perPage: 5,
    },
    columns: [
        {
            header: 'ID',
            name: '_id',
            sortable: true,
        },
        {
            header: 'Image',
            name: 'img',
            editor: {
                type: 'text',
            },
            sortable: true,
        },
        {
            header: 'Title',
            name: 'title',
            editor: {
                type: 'text',
            },
            sortable: true,
        },
        {
            header: 'Tags',
            name: 'tags',
            editor: {
                type: 'text',
            },
            sortable: true,
        },
        {
            header: 'Description',
            name: 'desc',
            editor: {
                type: 'text',
            }, //CustomTextEditor,
            sortable: true,
        },
        {
            header: 'Approved',
            name: 'a',
            editor: {
                type: 'radio',
                options: {
                    listItems: [
                        { text: 'Approved', value: true },
                        { text: 'Not approved', value: false },
                    ],
                },
            },
            sortable: true,
        },
        {
            header: 'Deactivated',
            name: 'd',
            editor: {
                type: 'radio',
                options: {
                    listItems: [
                        { text: 'Activated', value: false },
                        { text: 'Deactivated', value: true },
                    ],
                },
            },
            sortable: true,
        },
        {
            header: 'Section',
            name: 'section',
            editor: {
                type: 'select',
                options: {
                    listItems: [
                        { text: 'Markets', value: 'markets' },
                        { text: 'Skills', value: 'skills' },
                        { text: 'Blogs', value: 'blogs' },
                        { text: 'Events', value: 'events' },
                        { text: 'Hobbies', value: 'hobbies' },
                    ],
                },
            },
            sortable: true,
        },
    ],
    exportOptions: {},
}

const grid = new Grid(options)

grid.on('beforeRequest', (ev) => {
    const { instance, xhr } = ev
    ev.stop()

    const requestData = instance.getModifiedRows()
    requestData.variable = 'data what you want to send'
    xhr.send(JSON.stringify(requestData))
})

grid.on('beforeChange', (ev) => {
    console.log('before change:', ev)
})
grid.on('afterChange', (ev) => {
    grid.request('updateData')
    console.log('after change:', ev)
})

// 'markets' | 'skills' | 'blogs' | 'events' | 'hobbies'
