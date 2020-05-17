/* --- src/example-common.js --- */
var Example = {};

function extend(child, parent) {
    var F = function () {
    };
    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
}


/* --- src/example-paintPanel.js --- */
/**
 * Paint panel.
 */
cpu_set = [];
common_count = 0;
s = null;

Example.PaintPanel = function (containerId) {
    this.containerId = containerId;
};

Example.PaintPanel.prototype = {

    init: function () {
        s = this;
        this._initMarkup(this.containerId);
    },

    _initMarkup: function (containerId) {
        var container = $('#' + containerId);

        var self = this;
       container.append('<div class="sc-no-default-cmd">Агент подбора театра</div>');
               
		container.append('Режиссер:</br>');
		container.append('<input type="text" value="" id="cpu_producer" /></br>');
		container.append('Максимальное количество постановок:</br>');
		container.append('<input type="text" value="" id="max_flow_quantity" /></br>');
		container.append('Год постройки:</br>');
		container.append('<input type="text" value="" id="manufacture_year" /></br>');
		container.append('<button id="pick_up_cpus" type="button">Подобрать</button></br>');
		container.append('</br><table id="cpu_table" border="1"></table>');

		$('#pick_up_cpus').click(function () {
			cpu_set = [];
			common_count = 0;		
			self._searchElements('cpu_producer', 'nrel_producer');
                        setTimeout(self._searchElements, 1000, 'max_flow_quantity', 'nrel_manufacture_date');	
			setTimeout(self._searchElements, 2000, 'manufacture_year', 'nrel_max_flow_quantity');
			setTimeout(self._sort_cpu_set, 4000);
		});
    },


	_searchElements: function(element_id, name_of_node) {
		if (document.getElementById(element_id).value != "") {
			common_count++;
			var valueField = document.getElementById(element_id).value;
			SCWeb.core.Server.findIdentifiersSubStr(valueField, function(sc_node_addr) {
				var sc_node_addr_numb = 0;

                                if (sc_node_addr.sys.length != 0){
                                    sc_node_addr_numb = sc_node_addr.sys[0][0];
                                } else if (sc_node_addr.main.length != 0){
                                    sc_node_addr_numb = sc_node_addr.main[0][0];
                                } else if (sc_node_addr.common.length != 0){
                                    sc_node_addr_numb = sc_node_addr.common[0][0];
                                }
				SCWeb.core.Server.resolveScAddr([name_of_node],function(keynodes){
					var name_of_nrel_node_numb = keynodes[name_of_node];
					window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5A_A_F_A_F,[
						sc_type_node,
						sc_type_arc_common | sc_type_const,
						sc_node_addr_numb,
						sc_type_arc_pos_const_perm,
						name_of_nrel_node_numb]).done(function(elements){
							for (count = 0; count < elements.length; count++){
								window.scHelper.getIdentifier(elements[count][0],SCWeb.core.Server._current_language).done(function (cpu_name) {
									cpu_set.push(cpu_name);
								})
							}
						});
				});
			})
	};
},

	_sort_cpu_set: function () {
		var table = document.getElementById('cpu_table');
		table.innerHTML = "";
		var result_cpu_set = [];
		var control_count = 0;
		for (var count = 0; count < cpu_set.length; count++){
			control_count = 0;	
			for (var count1 = 0; count1 < cpu_set.length; count1++){
				if (cpu_set[count] == cpu_set[count1]) {
					control_count++;
				}
			}	
			if (control_count == common_count) {
				result_cpu_set.push(cpu_set[count])
			}
		}
		for (var count = 0; count < result_cpu_set.length; count++){
			for (var count1 = count+1; count1 < result_cpu_set.length; count1++){
				if (result_cpu_set[count] == result_cpu_set[count1]) {
					result_cpu_set.splice(count1, 1);
					count1--;
				}
			}
		}
		for (count = 0; count < result_cpu_set.length; count++) {
			table.innerHTML+='<tr><td>'+result_cpu_set[count]+'</td></tr>';
		}
	},

};


/* --- src/example-component.js --- */
/**
 * Example component.
 */
Example.DrawComponent = {
    ext_lang: 'cpu_searching',
    formats: ['format_cpu_searching_json'],
    struct_support: true,
    factory: function (sandbox) {
        return new Example.DrawWindow(sandbox);
    }
};

Example.DrawWindow = function (sandbox) {
    this.sandbox = sandbox;
    this.paintPanel = new Example.PaintPanel(this.sandbox.container);
    this.paintPanel.init();
    this.recieveData = function (data) {
        console.log("in recieve data" + data);
    };

    var scElements = {};

    function drawAllElements() {
        var dfd = new jQuery.Deferred();
       // for (var addr in scElements) {
            jQuery.each(scElements, function(j, val){
                var obj = scElements[j];
                if (!obj || obj.translated) return;
// check if object is an arc
                if (obj.data.type & sc_type_arc_pos_const_perm) {
                    var begin = obj.data.begin;
                    var end = obj.data.end;
                    // logic for component update should go here
                }

        });
        SCWeb.ui.Locker.hide();
        dfd.resolve();
        return dfd.promise();
    }

// resolve keynodes
    var self = this;
    this.needUpdate = false;
    this.requestUpdate = function () {
        var updateVisual = function () {
// check if object is an arc
            var dfd1 = drawAllElements();
            dfd1.done(function (r) {
                return;
            });


/// @todo: Don't update if there are no new elements
            window.clearTimeout(self.structTimeout);
            delete self.structTimeout;
            if (self.needUpdate)
                self.requestUpdate();
            return dfd1.promise();
        };
        self.needUpdate = true;
        if (!self.structTimeout) {
            self.needUpdate = false;
            SCWeb.ui.Locker.show();
            self.structTimeout = window.setTimeout(updateVisual, 1000);
        }
    }
    
    this.eventStructUpdate = function (added, element, arc) {
        window.sctpClient.get_arc(arc).done(function (r) {
            var addr = r[1];
            window.sctpClient.get_element_type(addr).done(function (t) {
                var type = t;
                var obj = new Object();
                obj.data = new Object();
                obj.data.type = type;
                obj.data.addr = addr;
                if (type & sc_type_arc_mask) {
                    window.sctpClient.get_arc(addr).done(function (a) {
                        obj.data.begin = a[0];
                        obj.data.end = a[1];
                        scElements[addr] = obj;
                        self.requestUpdate();
                    });
                }
            });
        });
    };
// delegate event handlers
    this.sandbox.eventDataAppend = $.proxy(this.receiveData, this);
    this.sandbox.eventStructUpdate = $.proxy(this.eventStructUpdate, this);
    this.sandbox.updateContent();
};
SCWeb.core.ComponentManager.appendComponentInitialize(Example.DrawComponent);


