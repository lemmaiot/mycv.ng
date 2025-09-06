// Add some interactive feedback
        document.addEventListener('DOMContentLoaded', function() {
            // Add hover effects to cards
            const cards = document.querySelectorAll('.bg-white.p-6');
            cards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px) scale(1.02)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });

            // Add click feedback to buttons
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                button.addEventListener('click', function() {
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                });
            });
        });

        // Add some fun easter egg
        let clickCount = 0;
        document.querySelector('.floating').addEventListener('click', function() {
            clickCount++;
            if (clickCount === 5) {
                alert('🎉 You found the easter egg! You clicked the 404 five times! 🎉');
                clickCount = 0;
            }
        });