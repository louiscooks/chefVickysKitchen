$(function () {
	$(".btnStartOrder").click(function () {
		$(".formStartOrder").submit();
		return false;
	});
	$(".btnEndOrder").click(function () {
		$(".formEndOrder").submit();
		return false;
	});
	$(".btn-close-address").click(function () {
		$(".address-warning-card").toggle();
	});
	$(".btn-close-checkout").click(function () {
		$(".checkout-info-card").toggle();
	});
	$(".btn-close-review").click(function () {
		$(".review-info-card").toggle();
	});
	$(".btn-close-date").click(function () {
		$(".date-info-card").toggle();
	});
});
