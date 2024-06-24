$('#trade-form').submit(function(e){
    e.preventDefault();
    var amount = $('#amount').val();
    var form = $(this);
    $.ajax({
        type: 'POST',
        url: 'trade.php',
        dataType: 'json',
        data: form.serialize(),
        beforeSend: function(){
            $('input[type=number], select').prop('disabled', true);
            $(this).find('[type=submit]').prop('disabled', true);
	        HoldOn.open({
				theme:'sk-rect',
				message:'Placing Trade',
       		});
        },
        success: function(data){
            $('input[type=number], select').prop('disabled', false);
            $(this).find('[type=submit]').prop('disabled', false);
		    HoldOn.close();
            if(data.status){
                Swal.fire(
                    'Trade Started',
                    'Your Trade Session of $'+amount+' has started',
                    'success'
                ).then(function() {
                    window.location.replace("index.php");
                });
            } else {
                Swal.fire(
                    data.title,
                    data.message,
                    "warning"
                );
            }
        },
        error: function(){
            $('input[type=number], select').prop('disabled', false);
            $(this).find('[type=submit]').attr('disabled', false);
		    HoldOn.close();
        }
    })
});