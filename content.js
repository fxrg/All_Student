// Blackboard All Students Selector Extension

(function() {
    'use strict';

    console.log('🎓 Blackboard Extension: تم التحميل');

    let autoMode = false;
    let selectedIds = new Set();
    let count = 0;

    // زر Stop
    function showStopButton() {
        let btn = document.querySelector('.ext-stop-btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.className = 'ext-stop-btn';
            btn.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99999;padding:12px 24px;background:#f44336;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:18px;font-weight:bold;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
            btn.onclick = function() {
                autoMode = false;
                alert('تم الإيقاف!\n\nتم اختيار ' + count + ' طالب');
                count = 0;
                selectedIds.clear();
                btn.remove();
            };
            document.body.appendChild(btn);
        }
        btn.textContent = '🛑 Stop (' + count + ')';
    }

    // إضافة زر All Students
    function addButton() {
        if (document.querySelector('.ext-all-students')) return;

        let allInstr = null;
        document.querySelectorAll('*').forEach(el => {
            if (el.textContent?.trim() === 'All instructors' && !allInstr) {
                allInstr = el.closest('[role="option"], li, [role="listitem"]') || el.parentElement?.parentElement;
            }
        });

        if (allInstr) {
            const btn = allInstr.cloneNode(true);
            btn.className = (allInstr.className || '') + ' ext-all-students';
            
            // غير النص فقط
            const walker = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT);
            let node;
            while (node = walker.nextNode()) {
                if (node.textContent.includes('All instructors')) {
                    node.textContent = node.textContent.replace('All instructors', 'All Students');
                }
            }
            
            btn.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (!autoMode) {
                    autoMode = true;
                    count = 0;
                    selectedIds.clear();
                    showStopButton();
                    alert('✅ تم التفعيل!\n\n• استمر بالضغط على حقل Recipients\n• كل ضغطة = طالب جديد\n• زر Stop للإيقاف');
                }
                
                // اختر طالب الآن
                selectStudent();
                
                return false;
            }, true);
            
            allInstr.parentNode.insertBefore(btn, allInstr.nextSibling);
            console.log('🎓 تم إضافة الزر');
        }
    }

    // اختيار طالب
    function selectStudent() {
        // أولاً: more
        let more = null;
        document.querySelectorAll('*').forEach(el => {
            if (/^\d+\s*more/i.test(el.textContent?.trim() || '')) {
                const r = el.getBoundingClientRect();
                if (r.width > 0 && r.height > 0) more = el;
            }
        });
        if (more) {
            more.click();
            console.log('🎓 تحميل المزيد');
            return;
        }

        // ابحث عن طالب
        const items = document.querySelectorAll('[role="option"], li, [role="listitem"]');
        for (let item of items) {
            const txt = item.textContent || '';
            const m = txt.match(/s\d{6,}/i);
            
            if (m && !selectedIds.has(m[0].toLowerCase()) &&
                !item.classList.contains('ext-all-students') &&
                !txt.includes('All instructors')) {
                
                const r = item.getBoundingClientRect();
                if (r.width > 0 && r.height > 0 && r.top > 0 && r.top < window.innerHeight) {
                    selectedIds.add(m[0].toLowerCase());
                    count++;
                    showStopButton();
                    item.click();
                    console.log('🎓 طالب', count, ':', m[0]);
                    return;
                }
            }
        }
    }

    // مراقبة - اختر تلقائي عند فتح القائمة
    const obs = new MutationObserver(() => {
        addButton();
        if (autoMode) {
            setTimeout(selectStudent, 100);
        }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    // تكرار
    setInterval(() => {
        addButton();
        if (autoMode) selectStudent();
    }, 400);

})();
