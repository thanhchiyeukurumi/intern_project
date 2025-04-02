// Xử lý Dropdown cho User Profile
document.addEventListener('DOMContentLoaded', function() {
    // Dropdown Toggle
    const dropdownButton = document.getElementById('userDropdownButton');
    const dropdown = document.getElementById('userDropdown');

    if (dropdownButton && dropdown) {
        dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = dropdownButton.getAttribute('aria-expanded') === 'true';
            dropdown.classList.toggle('hidden', isExpanded);
            dropdownButton.setAttribute('aria-expanded', !isExpanded);
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
                dropdownButton.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Esc key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdown.classList.add('hidden');
                dropdownButton.setAttribute('aria-expanded', 'false');
            }
        });
    }
});

