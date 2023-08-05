$(".form-group .form-label").on("click", function (event) {
  var $elem = $(event.currentTarget);
  var type = $elem.data("type");

  $elem.siblings("input,textarea").each(function (index, elem) {
    elem.focus();
  });

  $elem
    .closest("form")
    .addClass(type + "-is-focused");
});

$(".form-group input, .form-group textarea").on("focus", function (event) {
  var $elem = $(event.currentTarget);
  var type = $elem.data("type");

  $elem
    .closest("form")
    .addClass(type + "-is-focused");
});

$(".form-group input, .form-group textarea").on("blur", function (event) {
  var $elem = $(event.currentTarget);
  var type = $elem.data("type");

  if ($elem.val() === "") {
    $elem
      .closest("form")
      .removeClass(type + "-is-focused");
  }

});

$("#contact-form").on("submit", (event) => {
  event.preventDefault();
  const $form = $(event.currentTarget);

  const message = $form.find(".form-textarea").val();
  const messageWithoutWhitespace = message.replace(/\s/g, "");
  const notyf = new Notyf({
    duration: 5000
  });

  if (messageWithoutWhitespace.length < 15) {
    event.preventDefault();
    notyf.error("Please write me a longer message before sending!");
  } else {
    var data = new FormData($form.get(0));
    fetch($form.get(0).action, {
      method: $form.get(0).method,
      body: data,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        notyf.success("Thank you for contacting me!<br>٩(^ᴗ^)۶");
        $form.get(0).reset();
        $form.removeClass("email-is-focused message-is-focused");
      } else {
        response.json().then(data => {
          if (Object.hasOwn(data, 'errors')) {
            notyf.error(data["errors"].map(error => error["message"]).join(", "));
          } else {
            console.log(1);
            notyf.error("Oops! There was a problem submitting your form");
          }
        })
      }
    }).catch(error => {
      console.log(2);
      notyf.error("Oops! There was a problem submitting your form");
    }); 
  }
});
















