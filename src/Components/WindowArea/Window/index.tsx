import { Rnd } from "react-rnd";
import styles from "./Window.module.css";
import {
  MaximizeIcon,
  RestoreIcon,
  BackIcon,
  CloseIcon,
  MinimizeIcon,
} from "./Icons";
import { useStore } from "nanostores/preact";
import { ThemeStore } from "../../../store/darkMode";
import { FunctionComponent } from "preact";
import { OpenApps } from "../../../store/activeWindow";
import { useMemo, useRef, useState } from "preact/hooks";

interface Props {
  window_name: string;
  window_icon: string;
  show_back?: boolean;
  appid: string;
  Component?: any;
  height?: number;
  width?: number;
}

// Taken from puruVJ's macos web code :[]
export function randint(lower: number, upper: number) {
  if (lower > upper) [lower, upper] = [upper, lower];

  return lower + Math.floor((upper - lower) * Math.random());
}

export const WindowHolder: FunctionComponent<Props> = ({
  children,
  window_icon,
  window_name = "Hello World",
  show_back = false,
  appid,
  height,
  width,
}) => {
  const theme = useStore(ThemeStore);
  const OpenedApps = useStore(OpenApps);

  const ICON_COLOR_LIGHT = "#000000";
  const ICON_COLOR_DARK = "#ffffff";

  const ICON_COLOR = theme === "dark" ? ICON_COLOR_DARK : ICON_COLOR_LIGHT;

  const WindowRef = useRef<HTMLDivElement>();

  const randX = useMemo(() => randint(-600, 100), []);
  const randY = useMemo(() => randint(-100, 100), []);

  const [isMaximized, setIsMaximized] = useState(false);

  // ブラウザ機能のためのstate管理
  const [url, setUrl] = useState("https://www.bing.com");
  const iframeRef = useRef<HTMLIFrameElement>();
  const [history, setHistory] = useState<string[]>([url]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // URL入力の変更時にiframeのsrcを更新
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const navigateToUrl = (newUrl: string) => {
    const formattedUrl = newUrl.startsWith("http")
      ? newUrl
      : `https://${newUrl}`;
    setUrl(formattedUrl);
    iframeRef.current.src = formattedUrl;

    // 履歴に追加
    const newHistory = [...history];
    newHistory.splice(historyIndex + 1);
    setHistory([...newHistory, formattedUrl]);
    setHistoryIndex((prev) => prev + 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setUrl(history[historyIndex - 1]);
      iframeRef.current.src = history[historyIndex - 1];
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setUrl(history[historyIndex + 1]);
      iframeRef.current.src = history[historyIndex + 1];
    }
  };

  const reloadPage = () => {
    iframeRef.current.src = iframeRef.current.src;
  };

  return (
    <Rnd
      default={{
        x: (document.body.clientWidth + randX) / 2,
        y: (100 + randY) / 2,
        width: width || 320,
        height: height || 300,
      }}
      minWidth="300"
      minHeight="300"
      bounds="parent"
      size={
        isMaximized && {
          width: isMaximized ? document.body.clientWidth : 320,
          height: isMaximized ? document.body.clientHeight - 50 : 300,
        }
      }
      {...{
        position: isMaximized && {
          x: isMaximized ? 0 : undefined,
          y: isMaximized ? 0 : undefined,
        },
      }}
      dragHandleClassName="app-drag-handler"
    >
      <div ref={WindowRef} class={styles.container}>
        <div className={[styles.titlebar, "app-drag-handler"].join(" ")}>
          <div className={styles.title_stuff}>
            {show_back ? (
              <BackIcon />
            ) : (
              <img src={window_icon} class={styles.title_icon} />
            )}
            <p>{window_name}</p>
          </div>
          <div className={styles.window_actions}>
            <div className={styles.icon}>
              <MinimizeIcon height="14" width="14" color={ICON_COLOR} />
            </div>
            <div
              onClick={() => {
                setIsMaximized((prev) => !prev);
              }}
              className={styles.icon}
            >
              <MaximizeIcon color={ICON_COLOR} height="14" width="14" />
            </div>
            <div
              onClick={() => {
                WindowRef.current.classList.add(styles.close);
                setTimeout(() => {
                  OpenApps.set({
                    ...OpenedApps,
                    [appid]: {
                      ...OpenedApps[appid],
                      isActive: false,
                    },
                  });
                  WindowRef.current.classList.remove(styles.close);
                }, 100);
              }}
              className={[styles.icon, styles.close].join(" ")}
            >
              <CloseIcon color={ICON_COLOR} height="14" width="14" />
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {/* Edgeブラウザの基本機能実装 */}
          {window_icon === "src/assets/icons/startmenu/icons8-microsoft-edge.svg" && (
            <div className={styles.browser}>
              <div className={styles.browser_controls}>
                <button onClick={goBack}>←</button>
                <button onClick={goForward}>→</button>
                <button onClick={reloadPage}>⟳</button>
                <input
                  type="text"
                  value={url}
                  onChange={handleUrlChange}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      navigateToUrl(url);
                    }
                  }}
                />
                <button onClick={() => navigateToUrl(url)}>Go</button>
              </div>
              <iframe
                ref={iframeRef}
                src={url}
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            </div>
          )}
          {/* File Explorer */}
          {window_icon === "src/assets/icons/taskbar/file_explorer.webp" && (
            <div className={styles.file_explorer}>
              <h4>ファイル エクスプローラ</h4>
              <ul>
                <li>Documents</li>
                <li>Downloads</li>
                <li>Pictures</li>
                <li>Music</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </Rnd>
  );
};
