import React, {useCallback, useEffect, useState} from 'react';
import {encrypt, decrypt, formatSize, genRandHex, getBaseURL, translate, str2ua, hex2ua, ua2hex} from "../../utils/utils";
import i18n from "../../locale/locale";
import DraggableModal from "../modal";
import {Button, message, Drawer} from "antd";
import {FullscreenOutlined, ReloadOutlined} from "@ant-design/icons";

let ws = null;
let ctx = null;
let conn = false;
let canvas = null;
let secret = null;
let ticker = 0;
let frames = 0;
let bytes = 0;
let ticks = 0;
let title = i18n.t('DESKTOP.TITLE');

function ScreenModal(props) {
	const [resolution, setResolution] = useState('0x0');
	const [bandwidth, setBandwidth] = useState(0);
	const [fps, setFps] = useState(0);
	const [draggable, setDraggable] = useState(true);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const canvasRef = useCallback((e) => {
		if (e && props.open && !conn && !canvas) {
			secret = hex2ua(genRandHex(32));
			canvas = e;
			initCanvas(canvas);
			construct(canvas);
		}
	}, [props.open]);

	useEffect(() => {
		if (props.open) {
			setResolution('0x0');
			setBandwidth(0);
			setFps(0);
			setDraggable(true);
		}
	}, [props.device, props.open]);

	function initCanvas(canvas) {
		ctx = canvas.getContext('2d');
		canvas.width = 1200;
		canvas.height = 600;
	}

	function construct(canvas) {
		ws = new WebSocket(`${getBaseURL().replace('http', 'ws')}/api/device/desktop?device=${props.device}`);
		ws.binaryType = 'arraybuffer';
		ws.onopen = () => {
			conn = true;
			message.success(i18n.t('DESKTOP.CONNECTED'));
		};
		ws.onclose = () => {
			conn = false;
			message.error(i18n.t('DESKTOP.DISCONNECTED'));
		};
		ws.onmessage = (event) => {
			if (event.data instanceof ArrayBuffer) {
				let data = new Uint8Array(event.data);
				if (data.length > 8) {
					let body = data.slice(8);
					let decrypted = decrypt(body, secret);
					if (decrypted) {
						let json = JSON.parse(ua2hex(decrypted));
						if (json.type === 'image') {
							let img = new Image();
							img.onload = () => {
								ctx.clearRect(0, 0, canvas.width, canvas.height);
								ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
								frames++;
								bytes += data.length;
								ticks++;
								if (ticks % 30 === 0) {
									setFps(Math.round(frames / (ticks / 30)));
									setBandwidth(Math.round(bytes / (ticks / 30)));
									frames = 0;
									bytes = 0;
								}
							};
							img.src = 'data:image/jpeg;base64,' + json.data;
						} else if (json.type === 'resolution') {
							setResolution(`${json.width}x${json.height}`);
						}
					}
				}
			}
		};
	}

	function fullScreen() {
		if (canvas) {
			if (canvas.requestFullscreen) {
				canvas.requestFullscreen();
			} else if (canvas.webkitRequestFullscreen) {
				canvas.webkitRequestFullscreen();
			} else if (canvas.mozRequestFullScreen) {
				canvas.mozRequestFullScreen();
			} else if (canvas.msRequestFullscreen) {
				canvas.msRequestFullscreen();
			}
		}
	}

	function refresh() {
		if (ws && conn) {
			sendData({type: 'refresh'});
		}
	}

	function sendData(data) {
		if (conn) {
			let body = encrypt(str2ua(JSON.stringify(data)), secret);
			let buffer = new Uint8Array(body.length + 8);
			buffer.set(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), 0);
			buffer.set(body, 8);
			ws.send(buffer);
		}
	}

	const content = (
		<>
			<canvas
				id='painter'
				ref={canvasRef}
				style={{width: '100%', height: '100%'}}
			/>
			<Button
				style={{right:'59px'}}
				className='header-button'
				icon={<FullscreenOutlined />}
				onClick={fullScreen}
			/>
			<Button
				style={{right:'115px'}}
				className='header-button'
				icon={<ReloadOutlined />}
				onClick={refresh}
			/>
		</>
	);

	// Mobile: Use Drawer
	if (isMobile) {
		return (
			<Drawer
				open={props.open}
				onClose={props.onCancel}
				placement="bottom"
				height="100vh"
				bodyStyle={{ padding: 0 }}
				headerStyle={{ padding: '12px 16px' }}
				title={`${title} ${resolution} ${formatSize(bandwidth)}/s FPS: ${fps}`}
				destroyOnClose={true}
			>
				<div style={{ padding: 12, height: '100%' }}>
					{content}
				</div>
			</Drawer>
		);
	}

	// Desktop: Use DraggableModal
	return (
		<DraggableModal
			open={props.open}
			onCancel={props.onCancel}
			title={`${title} ${resolution} ${formatSize(bandwidth)}/s FPS: ${fps}`}
			width={1200}
			height={600}
			draggable={draggable}
			onDragStart={() => setDraggable(false)}
			onDragEnd={() => setDraggable(true)}
		>
			{content}
		</DraggableModal>
	);
}

export default ScreenModal;
