class MinimalistCompassApp {
    constructor() {
        this.currentPosition = null;
        // Fixed target location: 10.77324402650245, 106.69334843012038
        this.targetPosition = {
            lat: 10.77324402650245,
            lng: 106.69334843012038
        };
        this.compassArrow = document.getElementById('compassArrow');
        this.targetLocationInput = document.getElementById('targetLocation');
        this.setLocationBtn = document.getElementById('setLocation');

        this.targetLocationDisplay = document.getElementById('targetLocationDisplay');
        this.distanceDisplay = document.getElementById('distance');

        // GPS bearing to target
        this.magneticBearing = 0; // Bearing to target from GPS

        this.init();
    }

    init() {
        this.bindEvents();
        this.getCurrentLocation();

        // Verify target is fixed
        console.log('Fixed Target Location:', this.targetPosition);

        // Add test method to verify compass
        this.testCompass();
    }

    bindEvents() {
        // No need for input events since target is fixed
        // this.setLocationBtn.addEventListener('click', () => this.setTargetLocation());
        // this.targetLocationInput.addEventListener('keypress', (e) => {
        //     if (e.key === 'Enter') {
        //         this.setTargetLocation();
        //     }
        // });
    }

    // Device orientation not needed for fixed-point compass

    testCompass() {
        // Test with a known location to verify compass is working
        console.log('Testing compass with fixed target...');
        console.log('Target coordinates:', this.targetPosition);

        // Test bearing calculation
        const testLat = 10.0; // Test location
        const testLng = 106.0;
        const testBearing = this.calculateBearing(testLat, testLng, this.targetPosition.lat, this.targetPosition.lng);
        console.log(`Test bearing from (${testLat}, ${testLng}) to target: ${testBearing.toFixed(1)}°`);
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Trình duyệt không hỗ trợ định vị địa lý');
            return;
        }

        this.setLoading(true);

        try {
            const position = await this.getCurrentPositionPromise();
            this.currentPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Always update compass since target is fixed
            this.updateCompass();

        } catch (error) {
            this.showError('Không thể lấy vị trí hiện tại: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    getCurrentPositionPromise() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            });
        });
    }

    // Target location is fixed, no need for setTargetLocation method

    updateCompass() {
        if (!this.currentPosition) {
            return;
        }

        // Calculate magnetic bearing to target
        this.magneticBearing = this.calculateBearing(
            this.currentPosition.lat,
            this.currentPosition.lng,
            this.targetPosition.lat,
            this.targetPosition.lng
        );

        const distance = this.calculateDistance(
            this.currentPosition.lat,
            this.currentPosition.lng,
            this.targetPosition.lat,
            this.targetPosition.lng
        );

        // Debug logging
        console.log(`Current Position: ${this.currentPosition.lat.toFixed(6)}, ${this.currentPosition.lng.toFixed(6)}`);
        console.log(`Target Position: ${this.targetPosition.lat.toFixed(6)}, ${this.targetPosition.lng.toFixed(6)}`);
        console.log(`Magnetic Bearing: ${this.magneticBearing.toFixed(1)}°`);
        console.log(`Distance: ${distance.toFixed(1)} km`);

        // Always use GPS bearing only - arrow should always point to fixed target
        // regardless of device orientation
        this.rotateCompassArrow(this.magneticBearing);

        // Thêm hiệu ứng thành công
        this.compassArrow.classList.add('success');
        setTimeout(() => {
            this.compassArrow.classList.remove('success');
        }, 600);
    }

    // updateCompassWithOrientation method removed - not needed for fixed-point compass

    calculateBearing(lat1, lng1, lat2, lng2) {
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const lat1Rad = lat1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;

        const y = Math.sin(dLng) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        return (bearing + 360) % 360;
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Bán kính Trái Đất (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    rotateCompassArrow(bearing) {
        // Mũi tên la bàn chỉ về hướng Bắc (0°), nên cần điều chỉnh
        const rotation = bearing;

        this.compassArrow.style.transform = `rotate(${rotation}deg)`;

        // Debug logging for arrow rotation
        console.log(`Arrow rotated to: ${rotation.toFixed(1)}°`);
    }

    setLoading(loading) {
        const container = document.querySelector('.container');
        if (loading) {
            container.classList.add('loading');
        } else {
            container.classList.remove('loading');
        }
    }

    showError(message) {
        // Tạo thông báo lỗi tạm thời
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        // Tự động xóa sau 3 giây
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
}

// Khởi tạo ứng dụng khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    new MinimalistCompassApp();
});

// Thêm một số tính năng bổ sung cho trải nghiệm tốt hơn
class CompassEnhancements {
    constructor(compassApp) {
        this.compassApp = compassApp;
        this.addTouchGestures();
        this.addKeyboardShortcuts();
        this.addAutoRefresh();
    }

    addTouchGestures() {
        // Touch gestures removed - compass should always point to fixed target
        // No manual rotation allowed
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'l':
                        e.preventDefault();
                        this.compassApp.getCurrentLocation();
                        break;
                }
            }
        });
    }

    addAutoRefresh() {
        // Tự động cập nhật vị trí mỗi 30 giây (target is always fixed)
        setInterval(() => {
            if (this.compassApp.currentPosition) {
                this.compassApp.getCurrentLocation();
            }
        }, 30000);
    }
}

// Khởi tạo các tính năng bổ sung
document.addEventListener('DOMContentLoaded', () => {
    const compassApp = new MinimalistCompassApp();
    new CompassEnhancements(compassApp);
});
