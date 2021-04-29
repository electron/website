(() => {
  const button = document.getElementById('hello');
  const answer = document.getElementById('answer');

  button.addEventListener('click', async () => {
    // `myAPI.sayHello()` is defined in `preload.js`
    const response = await myAPI.sayHello();
    answer.textContent = response;
  });
})();
