#!/usr/bin/env python3
"""
视频背景音乐自由切换 - Python HTTP 服务器
使用 Python 内置 http.server 模块启动本地服务器
"""

import http.server
import socketserver
import os
import webbrowser
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class MyHandler(http.server.SimpleHTTPRequestHandler):
    """自定义请求处理器"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[{self.log_date_time_string()}] {format % args}")


def main():
    print("=" * 50)
    print("  视频背景音乐自由切换 - 本地服务器")
    print("=" * 50)
    print()
    print(f"  项目目录: {DIRECTORY}")
    print(f"  服务端口: {PORT}")
    print(f"  访问地址: http://localhost:{PORT}")
    print()
    print("  按 Ctrl+C 停止服务器")
    print("=" * 50)
    print()

    with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
        # 尝试自动打开浏览器
        if "--no-browser" not in sys.argv:
            try:
                webbrowser.open(f"http://localhost:{PORT}")
                print("  已自动打开浏览器")
            except Exception:
                print("  请手动在浏览器中打开上述地址")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n服务器已停止。")
            httpd.server_close()


if __name__ == "__main__":
    main()
