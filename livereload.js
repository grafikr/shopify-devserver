(function () {
  let previousContent = null;

  const stripResponse = (response) => response.replace(/<script id="__st">(.)*?<\/script>/, '');

  const sendRequest = async () => {
    try {
      let content = await fetch('').then((response) => response.text());
      content = stripResponse(content);

      if (previousContent !== null) {
        if (content !== previousContent) {
          window.location.reload();
          return;
        }
      }

      previousContent = content;
      setTimeout(sendRequest, 1000);
    } catch {
      setTimeout(sendRequest, 2500);
    }
  };

  setTimeout(sendRequest, 2500);
}());
