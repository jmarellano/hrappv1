let id = 0;
export class TMQFormBuilder {
	constructor(func) {
		var self = this;
		jsPlumb.ready(function () {
			var self = this;
			$("#form-properties").submit(function (e) {
				e.preventDefault();
				func();
			});
			console.log("--..JSPLUMB INITIALIZED..---");
			// Get the modal
			var modal = document.getElementById('myModal');

			// Get the <span> element that closes the modal
			var span = document.getElementsByClassName("close")[0];
			if (typeof span !== "undefined") {
				// When the user clicks on <span> (x), close the modal
				span.onclick = function () {
					modal.style.display = "none";
					$("#myModal .modal-body").html("");
				};
			}
			// When the user clicks anywhere outside of the modal, close it
			window.onclick = function (event) {
				if (event.target == modal) {
					modal.style.display = "none";
					$("#myModal .modal-body").html("");
				}
			};
			$('input[type=radio][name=options]').change(function () {
				if (this.value == 'true') {
					if ($("li").length > 0)
						$("ul").sortable("enable");
					$("li").css("cursor", "move");
				}
				else if (this.value == 'false') {
					if ($("li").length > 0)
						$("ul").sortable("disable");
					$("li").css("cursor", "default");
				}
			});
			$(".tmq-form-builder-tools").draggable({
				helper: "clone",
				refreshPositions: true,
			});
			$("#tmq-form-builder-center").droppable({
				drop: function (event, ui) {
					var self = this;
					var elem = "";
					switch ($(ui.draggable).data("form")) {
						case 'heading':
							elem = '<h2 style="text-align:left;border-bottom:1px solid #cacaca;" id="heading' + id + '" contenteditable="true">Heading</h2><div class="tmq-form-builder-close" id="close' + id + '" data-close="heading' + id + '"><i class="fa fa-times" aria-hidden="true" style="position:relative;top:-2px;"></i></div><div class="tmq-form-builder-edit" id="edit' + id + '" data-edit="heading' + id + '"><i class="fa fa-pencil" aria-hidden="true" style="position:relative;top:-2px;"></i></div>';
							break;
						case 'textfield':
							elem = '<div style="text-align:left;"><label contenteditable="true">Textfield:</label><input readonly="readonly" style="text-align:left;" id="textfield' + id + '" type="text" placeholder="" /></div><div class="tmq-form-builder-close" id="close' + id + '" data-close="textfield' + id + '"><i class="fa fa-times" aria-hidden="true" style="position:relative;top:-2px;"></i></div><div class="tmq-form-builder-edit" id="edit' + id + '" data-edit="textfield' + id + '"><i class="fa fa-pencil" aria-hidden="true" style="position:relative;top:-2px;"></i></div>';
							break;
						case 'emailfield':
							elem = '<div style="text-align:left;"><label contenteditable="true">Emailadd:</label><input readonly="readonly" style="text-align:left;" id="textfield' + id + '" type="email" placeholder="" /></div><div class="tmq-form-builder-close" id="close' + id + '" data-close="emailfield' + id + '"><i class="fa fa-times" aria-hidden="true" style="position:relative;top:-2px;"></i></div><div class="tmq-form-builder-edit" id="edit' + id + '" data-edit="emailfield' + id + '"><i class="fa fa-pencil" aria-hidden="true" style="position:relative;top:-2px;"></i></div>';
							break;
						case 'textarea':
							elem = '<div style="text-align:left;"><label contenteditable="true">Textarea:</label><textarea readonly="readonly" id="textarea' + id + '" style="resize:vertical;text-align:left;"></textarea></div><div class="tmq-form-builder-close" id="close' + id + '" data-close="textarea' + id + '"><i class="fa fa-times" aria-hidden="true" style="position:relative;top:-2px;"></i></div><div class="tmq-form-builder-edit" id="edit' + id + '" data-edit="textarea' + id + '"><i class="fa fa-pencil" aria-hidden="true" style="position:relative;top:-2px;"></i></div>';
							break;
						case 'dropdown':
							elem = '<div style="text-align:left;"><label contenteditable="true">Dropdown:</label><select readonly="readonly" id="dropdown' + id + '"><option value="true">TRUE</option><option value="false">FALSE</option></select></div><div class="tmq-form-builder-close" id="close' + id + '" data-close="dropdown' + id + '"><i class="fa fa-times" aria-hidden="true" style="position:relative;top:-2px;"></i></div><div class="tmq-form-builder-edit" id="edit' + id + '" data-edit="dropdown' + id + '"><i class="fa fa-pencil" aria-hidden="true" style="position:relative;top:-2px;"></i></div>';
							break;
						case 'radio':
							elem = '<div style="text-align:left;"><label contenteditable="true">Radio Buttons:</label><br /><input type="radio" id="radio' + id + '" name="radio' + id + '" value="true" /> <span>TRUE</span><br><input type="radio" name="radio' + id + '" id="radio' + id + '" value="false" /> <span>FALSE</span><br></div><div class="tmq-form-builder-close" id="close' + id + '" data-close="radio' + id + '"><i class="fa fa-times" aria-hidden="true" style="position:relative;top:-2px;"></i></div><div class="tmq-form-builder-edit" id="edit' + id + '" data-edit="radio' + id + '"><i class="fa fa-pencil" aria-hidden="true" style="position:relative;top:-2px;"></i></div>';
							break;
						case 'checkbox':
							elem = '<div style="text-align:left;"><label contenteditable="true">Checkboxes:</label><br /><input type="checkbox" id="checkbox' + id + '" name="checkbox' + id + '" value="true" /> <span>TRUE</span><br><input type="checkbox" name="checkbox' + id + '" id="checkbox' + id + '" value="false" /> <span>FALSE</span><br></div><div class="tmq-form-builder-close" id="close' + id + '" data-close="checkbox' + id + '"><i class="fa fa-times" aria-hidden="true" style="position:relative;top:-2px;"></i></div><div class="tmq-form-builder-edit" id="edit' + id + '" data-edit="checkbox' + id + '"><i class="fa fa-pencil" aria-hidden="true" style="position:relative;top:-2px;"></i></div>';
							break;
						case 'date':
							elem = '<div style="text-align:left;"><label contenteditable="true">Date:</label><input readonly="readonly" type="text" id="datepicker' + id + '" style="text-align:left;" class="datepicker" /></div><div class="tmq-form-builder-close" id="close' + id + '" data-close="datepicker' + id + '"><i class="fa fa-times" aria-hidden="true" style="position:relative;top:-2px;"></i></div><div class="tmq-form-builder-edit" id="edit' + id + '" data-edit="datepicker' + id + '"><i class="fa fa-pencil" aria-hidden="true" style="position:relative;top:-2px;"></i></div>';
							break;
						case 'paragraph':
							elem = '<div><p style="text-align:left;text-indent: 50px;" id="paragraph' + id + '" contenteditable="true">Lorem ipsum dolor sit amet, consectetur adipiscing elit. In feugiat justo sed elit semper imperdiet. Nulla eu sapien' +
								'in nisi finibus aliquet. Quisque egestas metus ut dignissim porta. Nam est dolor, laoreet quis lectus ac, dictum laoreet turpis. Maecenas vel nibh nunc. Aliquam elementum nunc lectus. Fusce pharetra,' +
								'augue non posuere lacinia, neque libero interdum est, non vestibulum magna erat nec tortor. Sed at nibh at sem elementum mollis mattis sit amet lectus.</p></div><div id="close' + id + '" class="tmq-form-builder-close" data-close="paragraph' + id + '"><i class="fa fa-times" aria-hidden="true" style="position:relative;top:-2px;"></i></div><div class="tmq-form-builder-edit" id="edit' + id + '" data-edit="paragraph' + id + '"><i class="fa fa-pencil" aria-hidden="true" style="position:relative;top:-2px;"></i></div>';
							break;
						case 'image':
							elem = '<div style="text-align:left;"><img src="example.jpg" width="40" height="40" id="image' + id + '" /></div><div class="tmq-form-builder-close" id="close' + id + '" data-close="image' + id + '"><i class="fa fa-times" aria-hidden="true" style="position:relative;top:-2px;"></i></div><div class="tmq-form-builder-edit" id="edit' + id + '" data-edit="image' + id + '"><i class="fa fa-pencil" aria-hidden="true" style="position:relative;top:-2px;"></i></div>';
							break;
						case 'applicant-email':
							elem = '<div style="text-align:left;"><label contenteditable="true">Emailadd:</label><input readonly="readonly" style="text-align:left;" class="applicant-email" id="textfield' + id + '" type="email" placeholder="" /></div><div class="tmq-form-builder-close" id="close' + id + '" data-close="emailfield' + id + '"><i class="fa fa-times" aria-hidden="true" style="position:relative;top:-2px;"></i></div><div class="tmq-form-builder-edit" id="edit' + id + '" data-edit="emailfield' + id + '"><i class="fa fa-pencil" aria-hidden="true" style="position:relative;top:-2px;"></i></div>';
							break;
					}
					//add first element when cart is empty
					if ($(self).find(".item").length > 0 && elem.trim() != "") {
						$(self).find(".item").remove();
						$('<li class="items"></li>').html(elem).appendTo(self);
					} else if (elem.trim() != "") {
						var i = 0; //used as flag to find out if element added or not
						$(this).children('li').each(function () {
							if ($(this).offset().top >= ui.offset.top) {
								$('<li class="items"></li>').html(elem).insertBefore($(this));
								i = 1;
								return false; //break loop
							}
						})
						//if element dropped at the end of cart
						if (i != 1) {
							$('<li class="items"></li>').html(elem).appendTo(this);
						}

					}
					//$("#datepicker"+id).datepicker();
					$("#close" + id).click(function (e) {
						jsPlumb.detachAllConnections($(this).parent());
						$(this).parent().remove();
						e.stopPropagation();
					});
					$("#edit" + id).click(function () {
						addEditListener(id, this, modal);
					});
					id++;
					$("ul").sortable();
				},
				accept: function (el) {
					if (el.hasClass('tmq-form-builder-tools')) {
						return true;
					} else
						return false;
				}
			})
		});
	}
	getData() {
		var data = { form: { title: $('#form-title').val(), description: $('#form-description').val(), submit: $('#form-submit').val() } };
		var Objs = [];
		var nodes = []
		$(".items").each(function (idx, elem) {
			var $elem = $(elem);
			var endpoints = jsPlumb.getEndpoints($elem.attr('id'));
			console.log('endpoints of ' + $elem.attr('id'));
			console.log(endpoints);
			nodes.push({
				blockId: $elem.attr('id'),
				nodetype: $elem.attr('data-nodetype'),
				positionX: parseInt($elem.css("left"), 10),
				positionY: parseInt($elem.css("top"), 10)
			});
			Objs.push({ id: $elem.attr('id'), html: $elem.html(), left: $elem.css('left'), top: $elem.css('top'), width: $elem.css('width'), height: $elem.css('height') });
		});
		data.dom = Objs;
		var connections = [];
		$.each(jsPlumb.getConnections(), function (idx, connection) {
			connections.push({
				connectionId: connection.id,
				pageSourceId: connection.sourceId,
				pageTargetId: connection.targetId
			});
		});

		Objs = {};
		Objs.nodes = nodes;
		Objs.connections = connections;
		Objs.numberOfElements = (id);
		data.nodes = Objs;
		return data;
	}
	loadData(data, preview) {
		if (Object.keys(data).length > 0) {
			$('#form-title').val(data.form.title);
			$('#form-description').val(data.form.description);
			$('#form-submit').val(data.form.submit);
			var s = "";
			var Objs = data.dom;
			for (var j in Objs) {
				var o = Objs[j];
				if (!preview)
					s = '<li class="items" style="left:' + o.left + '; top:' + o.top + '; width:' + o.width + '; height:' + o.height + ' "> ' + o.html + '</li>';
				if (preview) {
					o.html = o.html.replace('readonly="readonly"', "");
					o.html = o.html.replace('contenteditable="true"', "");
					s = '<div class="items" style="margin:auto;left:' + o.left + '; top:' + o.top + '; width:' + o.width + '; height:' + o.height + ' "> ' + o.html + '</div>';
				}
				$('#tmq-form-builder-center').append(s);
				if (!preview) {
					$('#tmq-form-builder-center .tmq-form-builder-close').eq(j).click(function (e) {
						jsPlumb.detachAllConnections($(this).parent());
						$(this).parent().remove();
						e.stopPropagation();
					});
				}
				if (!preview) {
					$('#tmq-form-builder-center .tmq-form-builder-edit').eq(j).click(function (e) {
						addEditListener(e.target.id.replace(/^\D+/g, ''), this, document.getElementById('myModal'));
					});
				}
			}
			if (preview) {
				$('#tmq-form-builder-center').append('<input type="submit" id="tmq-form-builder-submit" value="' + data.form.submit + '" />');
				$(".datepicker").datepicker();
			}
			var flowChartJson = data.nodes;
			var nodes = flowChartJson.nodes;
			$.each(nodes, function (index, elem) {
				if (elem.nodetype === 'startpoint') {
					repositionElement('startpoint', elem.positionX, elem.positionY);
				} else if (elem.nodetype === 'endpoint') {
					repositionElement('endpoint', elem.positionX, elem.positionY);
				} else if (elem.nodetype === 'task') {
					var id = addTask(elem.blockId);
					repositionElement(id, elem.positionX, elem.positionY);
				} else if (elem.nodetype === 'decision') {
					var id = addDecision(elem.blockId);
					repositionElement(id, elem.positionX, elem.positionY);
				} else {

				}
			});

			var connections = flowChartJson.connections;
			$.each(connections, function (index, elem) {
				var connection1 = jsPlumb.connect({
					source: elem.pageSourceId,
					target: elem.pageTargetId,
					anchors: ["BottomCenter", [0.75, 0, 0, -1]]

				});
			});

			var numberOfElements = flowChartJson.numberOfElements;
			id = parseInt(numberOfElements + 1);
			if (!preview) {
				$("ul").sortable();
			}
		}
	}

}
var addEditListener = function (id, obj, modal) {
	var ID = id;
	modal.style.display = "block";
	var self = obj;
	switch ($(obj).data("edit").replace(/[0-9]/g, '')) {
		case 'heading':
		case 'paragraph':
			var str = '<div class="modal-field-properties"><label class="modal-field-properties-label hidden">CSS Class: </label>' +
				'<input type="text" id="classname" value="' + ((typeof $(self).parent().children().eq(0).attr("class") !== "undefined") ? $(self).parent().children().eq(0).attr("class") : "") + '" class="modal-field-properties-value" />' +
				'<label class="modal-field-properties-label">Alignment: </label>' +
				'<select id="alignment" class="modal-field-properties-value"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select><br />' +
				'<div class="modal-field-properties-label"><input class="btn" type="button" value="Edit" /></div>';
			$("#myModal .modal-body").html(str);
			$("#alignment").val($(self).parent().children().eq(0).css("text-align"));
			$("#myModal .modal-body input[type=button]").click(function () {
				$(self).parent().children().eq(0).attr("class", $("#myModal .modal-body #classname").val());
				$(self).parent().children().eq(0).css("text-align", $("#myModal .modal-body #alignment").val());
				modal.style.display = "none";
				$("#myModal .modal-body").html("");
			});
			break;
		case 'textfield':
		case 'textarea':
		case 'datepicker':
		case 'emailfield':
			var str = '<div class="modal-field-properties"><label class="modal-field-properties-label hidden">CSS Class: </label>' +
				'<input type="text" id="classname" value="' + ((typeof $(self).parent().children().eq(0).children().eq(1).attr("class") !== "undefined") ? $(self).parent().children().eq(0).children().eq(1).attr("class") : "") + '" class="modal-field-properties-value" />' +
				'<label class="modal-field-properties-label">Required: </label>' +
				'<select id="required" class="modal-field-properties-value"><option value="false">No</option><option value="true">Yes</option></select><br />' +
				'<label class="modal-field-properties-label">Placeholder: </label>' +
				'<input type="text" id="placeholder" class="modal-field-properties-value" />' +
				'<div class="modal-field-properties-label"><input class="btn" type="button" value="Edit" /></div>';
			$("#myModal .modal-body").html(str);
			$("#required").val(($(self).parent().children().eq(0).children().eq(1).prop('required')) ? "true" : "false");
			$("#placeholder").val((typeof $(self).parent().children().eq(0).children().eq(1).attr("placeholder") !== "undefined") ? $(self).parent().children().eq(0).children().eq(1).attr("placeholder") : "");
			$("#myModal .modal-body input[type=button]").click(function () {
				$(self).parent().children().eq(0).children().eq(1).attr("class", $("#myModal .modal-body #classname").val());
				$(self).parent().children().eq(0).children().eq(1).prop('required', $("#myModal .modal-body #required").val());
				$(self).parent().children().eq(0).children().eq(1).attr("placeholder", $("#myModal .modal-body #placeholder").val());
				if ($("#myModal .modal-body #required").val() == "true") {
					var string = $(self).parent().children().eq(0).children().eq(0).html();
					string = string.replace('<span style="color:red;">*</span>', "");
					$(self).parent().children().eq(0).children().eq(0).html(string + '<span style="color:red;">*</span>');
				} else {
					var string = $(self).parent().children().eq(0).children().eq(0).html();
					string = string.replace('<span style="color:red;">*</span>', "");
					$(self).parent().children().eq(0).children().eq(0).html(string);
					$(self).parent().children().eq(0).children().eq(1).removeAttr('required');
				}
				modal.style.display = "none";
				$("#myModal .modal-body").html("");
			});
			break;
		case 'image':
			var str = '<div class="modal-field-properties"><label class="modal-field-properties-label hidden">CSS Class: </label>' +
				'<input type="text" id="classname" value="' + ((typeof $(self).parent().children().eq(0).children().eq(0).attr("class") !== "undefined") ? $(self).parent().children().eq(0).children().eq(0).attr("class") : "") + '" class="modal-field-properties-value" />' +
				'<label class="modal-field-properties-label">Alignment: </label>' +
				'<select id="alignment" class="modal-field-properties-value"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select><br />' +
				'<label class="modal-field-properties-label">Source: </label>' +
				'<input type="text" id="src" class="modal-field-properties-value" /><br />' +
				'<label class="modal-field-properties-label">Width: </label>' +
				'<input type="text" id="width" class="modal-field-properties-value" /><br />' +
				'<label class="modal-field-properties-label">Height: </label>' +
				'<input type="text" id="height" class="modal-field-properties-value" /><br />' +
				'<div class="modal-field-properties-label"><input class="btn" type="button" value="Edit" /></div>';
			$("#myModal .modal-body").html(str);
			$("#alignment").val($(self).parent().children().eq(0).css("text-align"));
			$("#myModal .modal-body input[type=button]").click(function () {
				$(self).parent().children().eq(0).children().eq(0).attr("class", $("#myModal .modal-body #classname").val());
				$(self).parent().children().eq(0).css('text-align', $("#myModal .modal-body #alignment").val());
				$(self).parent().children().eq(0).children().eq(0).attr("src", $("#myModal .modal-body #src").val());
				$(self).parent().children().eq(0).children().eq(0).attr("width", $("#myModal .modal-body #width").val());
				$(self).parent().children().eq(0).children().eq(0).attr("height", $("#myModal .modal-body #height").val());
				modal.style.display = "none";
				$("#myModal .modal-body").html("");
			});
			break;
		case 'dropdown':
			var str = '<div class="modal-field-properties"><label class="modal-field-properties-label hidden">CSS Class: </label>' +
				'<input type="text" value="' + ((typeof $(self).parent().children().eq(0).children().eq(1).attr("class") !== "undefined") ? $(self).parent().children().eq(0).children().eq(1).attr("class") : "") + '" id="classname" class="modal-field-properties-value" />' +
				'<label class="modal-field-properties-label">Required: </label>' +
				'<select id="required" class="modal-field-properties-value"><option value="false">No</option><option value="true">Yes</option></select><br />' +
				'<input type="text" class="modal-field-properties-label option-value" placeholder="Value" value="true" /> : <input type="text" class="modal-field-properties-label option-string" value="True" placeholder="String" />' +
				'<input type="text" class="modal-field-properties-label option-value" placeholder="Value" value="false" /> : <input type="text" class="modal-field-properties-label option-string" value="False" placeholder="String" />' +
				'<input type="button" id="add_opt" class="btn" value="Add Option" />' +
				'<div class="modal-field-properties-label"><input class="btn" id="submit" type="button" value="Edit" /></div>';
			$("#myModal .modal-body").html(str);
			$("#required").val(($(self).parent().children().eq(0).children().eq(1).prop('required')) ? "true" : "false");
			$("#myModal .modal-body #submit").click(function (e) {
				e.preventDefault();
				$(self).parent().children().eq(0).children().eq(1).attr("class", $("#myModal .modal-body #classname").val());
				$(self).parent().children().eq(0).children().eq(1).prop('required', $("#myModal .modal-body #required").val());
				if ($("#myModal .modal-body #required").val() == "true") {
					var string = $(self).parent().children().eq(0).children().eq(0).html();
					string = string.replace('<span style="color:red;">*</span>', "");
					$(self).parent().children().eq(0).children().eq(0).html(string + '<span style="color:red;">*</span>');
				} else {
					var string = $(self).parent().children().eq(0).children().eq(0).html();
					string = string.replace('<span style="color:red;">*</span>', "");
					$(self).parent().children().eq(0).children().eq(0).html(string);
					$(self).parent().children().eq(0).children().eq(1).removeAttr('required');
				}
				var str2 = "";
				for (var i = 0; i < $(".option-value").length; i++) {
					str2 = str2 + '<option value="' + $(".option-value").eq(i).val() + '">' + $(".option-value").eq(i).next().val() + '</option>';
				}
				$(self).parent().children().eq(0).children().eq(1).html(str2);
				modal.style.display = "none";
				$("#myModal .modal-body").html("");
			});
			$("#add_opt").click(function () {
				$('<input type="text" class="modal-field-properties-label option-value" placeholder="Value" /> : <input type="text" class="modal-field-properties-label option-string" placeholder="String" />').insertBefore($("#add_opt"));
			});
			break;
		case 'radio':
			var num = 2;
			var str = '<div class="modal-field-properties"><label class="modal-field-properties-label hidden">CSS Class: </label>' +
				'<input type="text" value="' + ((typeof $(self).parent().children().eq(0).children().eq(0).attr("class") !== "undefined") ? $(self).parent().children().eq(0).children().eq(0).attr("class") : "") + '" id="classname" class="modal-field-properties-value" />' +
				'<label class="modal-field-properties-label">Required: </label>' +
				'<select id="required" class="modal-field-properties-value"><option value="false">No</option><option value="true">Yes</option></select><br />' +
				'<input type="text" id="v' + 1 + '" class="modal-field-properties-label option-value option-value' + ID + '" placeholder="Value" value="true" /> : <input id="s' + 1 + '" type="text" class="modal-field-properties-label option-string option-string' + ID + '" value="True" placeholder="String" />' +
				'<input type="text" id="v' + 2 + '" class="modal-field-properties-label option-value option-value' + ID + '" placeholder="Value" value="false" /> : <input id="s' + 2 + '" type="text" class="modal-field-properties-label option-string option-string' + ID + '" value="False" placeholder="String" />' +
				'<input type="button" id="add_opt" class="btn" value="Add Option" />' +
				'<div class="modal-field-properties-label"><input class="btn" id="submit" type="button" value="Edit" /></div>';
			$("#myModal .modal-body").html(str);
			$("#required").val(($(self).parent().children().eq(0).children().find("input").eq(0).attr('required')) ? "true" : "false");
			$("#myModal .modal-body #submit").click(function (e) {
				e.preventDefault();
				$(self).parent().children().eq(0).children().eq(0).attr("class", $("#myModal .modal-body #classname").val());
				$(self).parent().children().eq(0).children().find("input").prop('required', $("#myModal .modal-body #required").val());
				$(self).parent().children().eq(0).children().eq(0).siblings().remove();
				$("<br />").insertAfter($(self).parent().children().eq(0).children().eq(0));
				for (var i = 0; i < num; i++) {
					$(self).parent().children().eq(0).append('<input type="radio" name="radio' + ID + '" id="radio' + ID + '" value="' + $("#v" + (i + 1)).val() + '" /> <span>' + $("#s" + (i + 1)).val() + '</span><br />');
				}
				if ($("#myModal .modal-body #required").val() == "true") {
					var string = $(self).parent().children().eq(0).children().eq(0).html();
					string = string.replace('<span style="color:red;">*</span>', "");
					$(self).parent().children().eq(0).children().eq(0).html(string + '<span style="color:red;">*</span>');
				} else {
					var string = $(self).parent().children().eq(0).children().eq(0).html();
					string = string.replace('<span style="color:red;">*</span>', "");
					$(self).parent().children().eq(0).children().eq(0).html(string);
					$(self).parent().children().eq(0).children().find("input").removeAttr('required');
				}

				modal.style.display = "none";
				$("#myModal .modal-body").html("");
			});
			$("#add_opt").click(function () {
				$('<input type="text" id="v' + (num + 1) + '" class="modal-field-properties-label option-value option-value' + ID + '" placeholder="Value" /> : <input id="s' + (num + 1) + '" type="text" class="modal-field-properties-label option-string option-string' + ID + '" placeholder="String" />').insertBefore($("#add_opt"));
				num++;
			});
			break;
		case 'checkbox':
			var num = 2;
			var str = '<div class="modal-field-properties"><label class="modal-field-properties-label hidden">CSS Class: </label>' +
				'<input type="text" value="' + ((typeof $(self).parent().children().eq(0).children().eq(0).attr("class") !== "undefined") ? $(self).parent().children().eq(0).children().eq(0).attr("class") : "") + '" id="classname" class="modal-field-properties-value" />' +
				'<label class="modal-field-properties-label">Required: </label>' +
				'<select id="required" class="modal-field-properties-value"><option value="false">No</option><option value="true">Yes</option></select><br />' +
				'<input type="text" id="v' + 1 + '" class="modal-field-properties-label option-value option-value' + ID + '" placeholder="Value" value="true" /> : <input id="s' + 1 + '" type="text" class="modal-field-properties-label option-string option-string' + ID + '" value="True" placeholder="String" />' +
				'<input type="text" id="v' + 2 + '" class="modal-field-properties-label option-value option-value' + ID + '" placeholder="Value" value="false" /> : <input id="s' + 2 + '" type="text" class="modal-field-properties-label option-string option-string' + ID + '" value="False" placeholder="String" />' +
				'<input type="button" id="add_opt" class="btn" value="Add Option" />' +
				'<div class="modal-field-properties-label"><input class="btn" id="submit" type="button" value="Edit" /></div>';
			$("#myModal .modal-body").html(str);
			$("#required").val(($(self).parent().children().eq(0).children().find("input[type=checkbox]").eq(0).attr('required')) ? "true" : "false");
			$("#myModal .modal-body #submit").click(function (e) {
				e.preventDefault();
				$(self).parent().children().eq(0).children().eq(0).attr("class", $("#myModal .modal-body #classname").val());
				$(self).parent().children().eq(0).children().find("input").prop('required', $("#myModal .modal-body #required").val());
				$(self).parent().children().eq(0).children().eq(0).siblings().remove();
				$("<br />").insertAfter($(self).parent().children().eq(0).children().eq(0));
				for (var i = 0; i < num; i++) {
					$(self).parent().children().eq(0).append('<input type="checkbox" name="checkbox' + ID + '" id="checkbox' + ID + '" value="' + $("#v" + (i + 1)).val() + '" /> <span>' + $("#s" + (i + 1)).val() + '</span><br />');
				}
				if ($("#myModal .modal-body #required").val() == "true") {
					var string = $(self).parent().children().eq(0).children().eq(0).html();
					string = string.replace('<span style="color:red;">*</span>', "");
					$(self).parent().children().eq(0).children().eq(0).html(string + '<span style="color:red;">*</span>');
				} else {
					var string = $(self).parent().children().eq(0).children().eq(0).html();
					string = string.replace('<span style="color:red;">*</span>', "");
					$(self).parent().children().eq(0).children().eq(0).html(string);
					$(self).parent().children().eq(0).children().find("input").removeAttr('required');
				}

				modal.style.display = "none";
				$("#myModal .modal-body").html("");
			});
			$("#add_opt").click(function () {
				$('<input type="text" id="v' + (num + 1) + '" class="modal-field-properties-label option-value option-value' + ID + '" placeholder="Value" /> : <input id="s' + (num + 1) + '" type="text" class="modal-field-properties-label option-string option-string' + ID + '" placeholder="String" />').insertBefore($("#add_opt"));
				num++;
			});
			break;
	}
}