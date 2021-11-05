// eslint-disable-next-line func-names
(function () {
  let previousContent = null;
  let previousUrl = window.location.href;

  const stripResponse = (response) => response.replace(/<script id="__st">(.)*?<\/script>/, '');

  const sendRequest = async () => {
    try {
      let content = await fetch('').then((response) => response.text());
      content = stripResponse(content);
      const url = window.location.href;

      if (url !== previousUrl) {
        previousContent = null;
      }

      if (previousContent !== null) {
        if (content !== previousContent) {
          window.location.reload();
          return;
        }
      }

      previousContent = content;
      previousUrl = url;
      setTimeout(sendRequest, 1000);
    } catch {
      setTimeout(sendRequest, 2500);
    }
  };

  setTimeout(sendRequest, 2500);
}());
