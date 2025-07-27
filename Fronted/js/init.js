// Initialize BRIGHTLEARN Application
document.addEventListener('DOMContentLoaded', async () => {
    // Import all core modules
    const [
        BrightLearn,
        LessonTemplates,
        LessonInteractions,
        LearningAnalytics,
        AdaptiveLearning,
        AssessmentManager
    ] = await Promise.all([
        import('./js/brightlearn.js'),
        import('./js/lesson-templates.js'),
        import('./js/lesson-interactions.js'),
        import('./js/learning-analytics.js'),
        import('./js/adaptive-learning.js'),
        import('./js/assessment-manager.js')
    ]).catch(error => {
        console.error('Failed to load modules:', error);
        showErrorScreen('Failed to initialize application. Please refresh the page.');
    });

    // Load required stylesheets
    loadStylesheets([
        'css/brightlearn.css',
        'css/lesson-viewer.css',
        'css/interactive-elements.css',
        'css/learning-analytics.css',
        'css/adaptive-learning.css'
    ]);

    // Initialize service worker for offline support
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    // Setup error tracking
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('Global error:', { message, source, lineno, colno, error });
        trackError({ message, source, lineno, colno, error });
    };

    // Initialize IndexedDB for offline data
    initializeDatabase()
        .then(() => console.log('Database initialized'))
        .catch(error => console.error('Database initialization failed:', error));

    // Setup auto-save functionality
    setupAutoSave();

    // Initialize real-time connection
    initializeRealtimeConnection();
});

function loadStylesheets(stylesheets) {
    stylesheets.forEach(stylesheet => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = stylesheet;
        document.head.appendChild(link);
    });
}

function showErrorScreen(message) {
    document.body.innerHTML = `
        <div class="error-screen">
            <div class="error-content">
                <h1>Oops!</h1>
                <p>${message}</p>
                <button onclick="location.reload()">Try Again</button>
            </div>
        </div>
    `;
}

async function initializeDatabase() {
    const dbName = 'brightlearn_db';
    const version = 1;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object stores
            if (!db.objectStoreNames.contains('userProgress')) {
                db.createObjectStore('userProgress', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('offlineContent')) {
                db.createObjectStore('offlineContent', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('userPreferences')) {
                db.createObjectStore('userPreferences', { keyPath: 'id' });
            }
        };
    });
}

function setupAutoSave() {
    let saveTimeout;
    const saveDelay = 1000; // 1 second

    document.addEventListener('input', (event) => {
        if (event.target.matches('[data-autosave]')) {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                saveContent(event.target);
            }, saveDelay);
        }
    });
}

async function saveContent(element) {
    const content = {
        id: element.id,
        value: element.value,
        timestamp: new Date().toISOString()
    };

    try {
        // Save to IndexedDB
        const db = await getDatabase();
        const transaction = db.transaction(['userProgress'], 'readwrite');
        const store = transaction.objectStore('userProgress');
        await store.put(content);

        // Sync with server if online
        if (navigator.onLine) {
            await syncWithServer(content);
        }
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
}

function initializeRealtimeConnection() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws`);

    ws.onopen = () => {
        console.log('Real-time connection established');
        sendHeartbeat();
    };

    ws.onmessage = (event) => {
        handleRealtimeMessage(JSON.parse(event.data));
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setTimeout(initializeRealtimeConnection, 5000); // Retry after 5 seconds
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
        setTimeout(initializeRealtimeConnection, 5000); // Retry after 5 seconds
    };

    // Send heartbeat every 30 seconds
    function sendHeartbeat() {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
            setTimeout(sendHeartbeat, 30000);
        }
    }
}

function handleRealtimeMessage(message) {
    switch (message.type) {
        case 'update':
            handleContentUpdate(message.data);
            break;
        case 'notification':
            showNotification(message.data);
            break;
        case 'achievement':
            handleAchievement(message.data);
            break;
        case 'sync':
            handleSyncRequest(message.data);
            break;
        default:
            console.log('Unknown message type:', message.type);
    }
}

async function handleContentUpdate(data) {
    const contentElement = document.querySelector(`[data-content-id="${data.id}"]`);
    if (contentElement) {
        // Update content with animation
        contentElement.classList.add('updating');
        await updateContent(contentElement, data);
        contentElement.classList.remove('updating');
    }
}

async function handleSyncRequest(data) {
    try {
        const localData = await getLocalData();
        const merged = mergeData(localData, data);
        await saveLocalData(merged);
        await syncWithServer(merged);
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

function showNotification(data) {
    const notification = document.createElement('div');
    notification.className = `notification ${data.type}`;
    notification.textContent = data.message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Export necessary functions for use in other modules
export {
    initializeDatabase,
    setupAutoSave,
    initializeRealtimeConnection,
    handleRealtimeMessage
};
