

export function check_document (doc = document) {
	if (typeof doc.createElement !== "function") {
		throw new Error("[blueshell terminal] No valid HTML document to write in")
	}
	return doc
}

export function get_container (selector, doc=document) {
	doc = check_document(doc)
	const container = doc.querySelector(selector)
	if (!container) {
		throw new Error("[blueshell terminal] No element matches the selector " + selector)
	}
	return container
}

/**
 * @param doc the HTMLDocument object
 * @param options
 * @return 
 */
export function make_terminal (doc=document, options={}) {
	options = {
		prefix: "> ",
		no_style: false,
		...options
	}
	doc = check_document(doc)

	const wrapper = doc.createElement("div")
	wrapper.classList.add("jsterminal", "terminal")

	const input = doc.createElement("textarea")
	
	const input_section = doc.createElement("div")
	input_section.classList.add("input")
	//input_section.classList.add("")
	
	const input_prefix = doc.createElement("span")
	input_prefix.appendChild(doc.createTextNode(options.input_prefix || options.prefix))
	
	input_section.appendChild(input_prefix)
	
	input_section.appendChild(input)

	const screen_section = doc.createElement("pre")
	screen_section.classList.add("screen")
	
	const output_section = doc.createElement("div")
	output_section.classList.add("out")
	
	let separator
	if (!options.no_separator) {
		separator = document.createElement("hr")
		separator.classList.add("separator")
	}
	else {
		separator = doc.createTextNode("")
	}

	screen_section.appendChild(output_section)
	screen_section.appendChild(separator)
	screen_section.appendChild(input_section)

	wrapper.appendChild(screen_section)

	// focus on input
	wrapper.addEventListener("click", evt => {
		input.focus()
	})

	// print
	function print (value, options={}) {
		const output = value.appendChild ? value : doc.createTextNode(value)
		/*
		const output_prefix = doc.createElement("span")
		output_prefix.appendChild(doc.createTextNode(options.output_prefix || options.prefix))
		output.appendChild(options.prefix || output_prefix)
		*/
		output_section.appendChild(output)
	}

	function set_input(value) {
		input.value = value
	}

	const key_bindings = {
		"Enter": (value, print, set_input) => {
			print(value)
			set_input("")
		},
		...options.key_bindings
	}

	/**
	 * set key action
	 * @param key a value key corresponding to evt.key
	 * @param action function (value, print, set_input)
	 * 		- value: the current value of the input
	 * 		- print: function print of the terminal
	 * 		- set_input: function to set the value of the input
	 */
	function set_key_action (key, action) {
		key_bindings[key] = action
	}

	input.addEventListener('keydown', async function (evt) {
		const action = key_bindings[evt.key]
		if (typeof action === "function") {
			action(input.value, print, set_input)
		}
	}, false);

	if (!options.no_style) {

		input.style.border = "inherit"
		input.style.outline = "inherit"
		input.style.font = "inherit"
		input.style.background = "inherit"
		input.style.color = "inherit"
		input.style.width = "100%"
		input.style.margin = 0
		input.style.padding = 0
		input.style.resize = "none"
		input.wrap = "hard"
		input.rows = "1"
		//input_section.style.paddingBottom = "2em"
		input_section.style.width = "100%"
		screen_section.style.width = "100%"
		output_section.style.width = "100%"
		wrapper.style.overflowY = "auto"
		wrapper.style.height = options.height || "350px"
	}
	return {
		print,
		set_input,
		set_key_action,
		element: wrapper
	}
}

export function quick (selector, doc=document, options={
	output_prefix: null,
	input_prefix: null,
	prefix: "> ",
	no_style: false
}) {
	const container = get_container(selector, doc)
	const terminal = make_terminal(doc, options)
	container.appendChild(terminal.element)

	return terminal
}