// Mobile menu toggle
document.querySelector('button.md\\:hidden').addEventListener('click', function() {
    const sidebar = document.querySelector('aside');
    sidebar.classList.toggle('hidden');
});

document.getElementById('language-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const languageInput = document.getElementById('language');
    const languageList = document.getElementById('language-list');
    const newLanguage = languageInput.value.trim();
    if (newLanguage) {
        const listItem = document.createElement('li');
        listItem.className = 'flex justify-between items-center p-2 bg-gray-100 rounded-lg';
        listItem.innerHTML = `
            <span>${newLanguage}</span>
            <button class="text-red-500 hover:text-red-700 focus:outline-none" onclick="removeLanguage(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        languageList.appendChild(listItem);
        languageInput.value = '';
    }
});

function removeLanguage(button) {
    const listItem = button.parentElement;
    listItem.remove();
}