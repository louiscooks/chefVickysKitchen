$(function () {
	$(".btnStartOrder").click(function () {
		$(".formStartOrder").submit();
		return false;
	});
	$(".btnEndOrder").click(function () {
		$(".formEndOrder").submit();
		return false;
	});
});
