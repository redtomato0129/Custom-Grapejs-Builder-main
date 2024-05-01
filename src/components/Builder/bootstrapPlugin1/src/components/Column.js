import columnsIcon from "raw-loader!../icons/columns-solid.svg";

export const ColumnBlock = (bm, label) => {
    bm.add('column').set({
        label: `${columnsIcon}<div>${label}</div>`,
        category: 'Layout',
        content: {
            type: 'column',
            classes: ['grp-col-md','gr-col-lg','grp-col-xs','grp-col-sm']
        }
    });
};

export default (domc, editor) => {
    const defaultType = domc.getType('default');
    const defaultModel = defaultType.model;
    const defaultView = defaultType.view;
    const spans = [1,2,3,4,5,6,7,8,9,10,11,12];

    domc.addType('column', {
        model: defaultModel.extend({
            defaults: Object.assign({}, defaultModel.prototype.defaults, {
                'custom-name': 'Column',
                draggable: '.row',
                droppable: true,
                stylable: ['font-family', 'font-size', 'color', 'background-color','border-color','border-style','border-width'],
                resizable: {
                    updateTarget: (el, rect, opt)=>{
                        const selected =  editor.getSelected() ;
                        
                        if(!selected){ return ; }
                        
                        //compute the current screen size (bootstrap semantic)
                        const docWidth = el.getRootNode().body.offsetWidth ;
                        let currentSize = "" ;
                        // if(docWidth >= 1200){
                        //     currentSize = "xl" ;
                        // } else
                        if(docWidth >= 1024){
                            currentSize = "lg" ;
                        } else if(docWidth >= 758){
                            currentSize = "md" ;
                        } else if(docWidth >= 365){
                            currentSize = "xs" ;
                        }

                        //compute the threshold when add on remove 1 col span to the element
                        const row = el.parentElement ;
                        const oneColWidth = row.offsetWidth / 12 ;
                        //the threshold is half one column width
                        const threshold = oneColWidth*0.5 ;

                        //check if we are growing or shrinking the column
                        const grow = rect.w > el.offsetWidth + threshold;
                        const shrink = rect.w < el.offsetWidth - threshold;
                        if(grow || shrink){
                            let testRegexp = new RegExp("^grp-col-"+currentSize+"-\\d{1,2}$") ;
                            if(!currentSize){
                                testRegexp = new RegExp("^grp-col-\\d{1,2}$") ;
                            }
                            let found = false;
                            let sizesSpans = {} ;
                            let oldSpan = 0;
                            let oldClass = null;
                            for(let cl of el.classList){
                                if(cl.indexOf("grp-col-") === 0){
                                    let [a,c,size,span] = cl.split("-") ;
                                    if(!span){
                                        span = size;
                                        size = "" ;
                                    }
                                    sizesSpans[size] = span ;
                                    if(size === currentSize){
                                        //found the col-XX-99 class
                                        oldClass = cl;
                                        oldSpan = span ;
                                        found = true;
                                    }
                                }
                            }

                            if(!found){
                                const sizeOrder = ["", "xs", "sm", "md", "lg", "xl"] ;
                                for(let s of sizeOrder){
                                    if(sizesSpans[s]){
                                        oldSpan = sizesSpans[s];
                                        found = true ;
                                    }
                                    if(s === currentSize){
                                        break;
                                    }
                                }
                            }

                            let newSpan = Number(oldSpan) ;
                            if(grow){
                                newSpan++ ;
                            }else{
                                newSpan-- ;
                            }
                            if(newSpan > 12){ newSpan = 12 ; }
                            if(newSpan < 1){ newSpan = 1 ; }

                            let newClass = "grp-col-"+currentSize+"-"+newSpan ;
                            if(!currentSize){
                                newClass = "grp-col-"+newSpan ;
                            }
                            //update the class
                            selected.addClass(newClass) ;
                            if(oldClass && oldClass !== newClass){
                                selected.removeClass(oldClass) ;
                            }
                            //notify the corresponding trait to update its value accordingly
                            selected.getTrait((currentSize||"xs")+"_width").view.postUpdate() ;
                        }
                    },
                    tl: 0, 
                    tc: 0, 
                    tr: 0, 
                    cl: 0, 
                    cr: 1, 
                    bl: 0, 
                    bc: 0, 
                    br: 0 
                },
                traits: [
                    {
                        id: "xs_width",
                        type: 'class_select',
                        options: [
                            {value: 'col', name: 'Equal'},
                            {value: 'col-auto', name: 'Variable'},
                            ... spans.map(function(i) { return {value: 'grp-col-xs-'+i, name: i+'/12'} })
                        ],
                        label: 'XS Width',
                    },
                    {
                        id: "md_width",
                        type: 'class_select',
                        options: [
                            {value: '', name: 'None'},
                            {value: 'col-md', name: 'Equal'},
                            {value: 'col-md-auto', name: 'Variable'},
                            ... spans.map(function(i) { return {value: 'grp-col-md-'+i, name: i+'/12'} })
                        ],
                        label: 'MD Width',
                    },
                    {
                        id: "lg_width",
                        type: 'class_select',
                        options: [
                            {value: '', name: 'None'},
                            {value: 'col-lg', name: 'Equal'},
                            {value: 'col-lg-auto', name: 'Variable'},
                            ... spans.map(function(i) { return {value: 'grp-col-lg-'+i, name: i+'/12'} })
                        ],
                        label: 'LG Width',
                    },
                    
                    {
                        type: 'class_select',
                        options: [
                            {value: '', name: 'None'},
                            ... spans.map(function(i) { return {value: 'offset-'+i, name: i+'/12'} })
                        ],
                        label: 'XS Offset',
                    },
                    {
                        type: 'class_select',
                        options: [
                            {value: '', name: 'None'},
                            ... spans.map(function(i) { return {value: 'offset-md-'+i, name: i+'/12'} })
                        ],
                        label: 'MD Offset',
                    },
                ].concat(defaultModel.prototype.defaults.traits)
            }),
        }, {
            isComponent(el) {
                let match = false;
                if(el && el.classList) {
                    el.classList.forEach(function(klass) {
                        if(klass=="grp-col" || klass.match(/^grp-col-/)) {
                            match = true;
                        }
                    });
                }
                if(match) return {type: 'column'};
            }
        }),
        view: defaultView
    });
}
