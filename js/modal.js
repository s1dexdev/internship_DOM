const myModal = function () {
    let isFlag = false;
    const modalWindowMarkup = createModal();
    const modal = {
        open() {
            if (isFlag) {
                return;
            }
            modalWindowMarkup.classList.add('open');
        },
        close() {
            modalWindowMarkup.classList.remove('open');
        },
        destroy() {
            modalWindowMarkup.parentNode.removeChild(modalWindowMarkup);
            modalWindowMarkup.removeEventListener('click', listener);
            window.removeEventListener('keydown', listener);

            isFlag = true;
        },
    };

    const listener = event => {
        if (event.target.dataset.close || event.code === 'Escape') {
            modal.close();
            modal.destroy();
        }
    };

    modalWindowMarkup.addEventListener('click', listener);
    window.addEventListener('keydown', listener);

    return modal;
};

function createModal() {
    const markup = document.createElement('div');

    markup.classList.add('modal');
    markup.insertAdjacentHTML(
        'afterbegin',
        `
        <div class="modal-overlay" data-close="true">
          <div class="modal-window">
            <span class="modal-close" data-close="true">&times;</span>
            <form class="form">
                <label>Enter new name
                    <input type="text" name="title" />
                </label>

                <button type="button" data-action="btn-accept">Accept</button>
            </form>
          </div>
        </div>
  `,
    );
    document.body.appendChild(markup);

    return markup;
}

export default myModal;
