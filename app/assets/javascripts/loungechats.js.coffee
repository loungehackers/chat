$ ->
	socket = new WebSocket "ws://#{window.location.host}/chat"

	socket.onmessage = (event) ->
		if event.data.length
			$output = $("#output")
			$output.append "#{event.data}<br>"
			output = $output[0]
			output.scrollTop = output.scrollHeight;

	$("body").on "submit", "form.chat", (event) ->
		event.preventDefault()
		$textarea = $(this).find("textarea")
		socket.send formatMessage $textarea.val()
		$textarea.val(null)

	$("form.chat textarea").focus
	$("form.chat textarea").on "keyup", (event) ->
		if event.keyCode == 13 && !event.shiftKey
			$("form.chat").submit()

formatMessage = (message) ->
	me = $("#me").text()
	"&lt;#{me}&gt; #{message}"
