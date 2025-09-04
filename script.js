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

        // Device orientation
        this.deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
        this.magneticBearing = 0; // Bearing to target from GPS
        this.isOrientationSupported = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.getCurrentLocation();
        this.initDeviceOrientation();

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

    initDeviceOrientation() {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ requires permission - show permission dialog
            this.showPermissionDialog();
        } else if (typeof DeviceOrientationEvent !== 'undefined') {
            // Android and older iOS
            this.startDeviceOrientation();
        } else {
            console.log('Device orientation not supported');
            this.fallbackToGPSOnly();
        }
    }

    showPermissionDialog() {
        const permissionDialog = document.getElementById('compassPermission');
        const enableButton = document.getElementById('enableCompass');

        permissionDialog.style.display = 'flex';

        enableButton.addEventListener('click', () => {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        permissionDialog.style.display = 'none';
                        this.startDeviceOrientation();
                    } else {
                        console.log('Device orientation permission denied');
                        this.fallbackToGPSOnly();
                        permissionDialog.style.display = 'none';
                    }
                })
                .catch(console.error);
        });
    }

    startDeviceOrientation() {
        this.isOrientationSupported = true;
        window.addEventListener('deviceorientation', (event) => {
            this.deviceOrientation = {
                alpha: event.alpha, // Compass direction (0-360)
                beta: event.beta,   // Front-to-back tilt
                gamma: event.gamma  // Left-to-right tilt
            };
            this.updateCompassWithOrientation();
        });
    }

    fallbackToGPSOnly() {
        console.log('Using GPS-only mode');
        this.isOrientationSupported = false;
    }

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

        // Update compass based on device orientation if supported
        if (this.isOrientationSupported) {
            this.updateCompassWithOrientation();
        } else {
            // Fallback to GPS-only mode
            this.rotateCompassArrow(this.magneticBearing);
        }

        // Thêm hiệu ứng thành công
        this.compassArrow.classList.add('success');
        setTimeout(() => {
            this.compassArrow.classList.remove('success');
        }, 600);
    }

    updateCompassWithOrientation() {
        if (!this.isOrientationSupported || this.deviceOrientation.alpha === null) {
            return;
        }

        // Calculate the relative bearing considering device orientation
        // deviceOrientation.alpha is the compass direction (0-360)
        // We need to adjust the arrow rotation based on device orientation
        const deviceHeading = this.deviceOrientation.alpha;
        const targetBearing = this.magneticBearing;

        // Calculate the relative angle between device heading and target bearing
        // The arrow should point in the direction of the target relative to device orientation
        let relativeAngle = targetBearing - deviceHeading;

        // Normalize to -180 to 180 range
        while (relativeAngle > 180) relativeAngle -= 360;
        while (relativeAngle < -180) relativeAngle += 360;

        // Rotate arrow to point to target relative to device orientation
        // The arrow should point in the direction of the target
        this.rotateCompassArrow(relativeAngle);

        // Debug logging
        console.log(`Device Heading: ${deviceHeading.toFixed(1)}°, Target Bearing: ${targetBearing.toFixed(1)}°, Relative Angle: ${relativeAngle.toFixed(1)}°`);
    }

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
        const compass = document.querySelector('.arrow-compass');
        let startAngle = 0;
        let currentAngle = 0;

        compass.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = compass.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            startAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
        });

        compass.addEventListener('touchmove', (e) => {
            e.preventDefault();
            // Target is always fixed, so we can always allow touch interaction

            const touch = e.touches[0];
            const rect = compass.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
            const deltaAngle = angle - startAngle;

            // Cập nhật góc xoay tạm thời
            currentAngle = deltaAngle * 180 / Math.PI;
            this.compassApp.compassArrow.style.transform = `rotate(${currentAngle}deg)`;
        });
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