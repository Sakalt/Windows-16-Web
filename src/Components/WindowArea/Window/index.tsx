import { Rnd } from "react-rnd";
import styles from "./Window.module.css";
import {
  MaximizeIcon,
  RestoreIcon,
  BackIcon,
  CloseIcon,
  MinimizeIcon,
  AddTabIcon, // 追加するタブ用のアイコン
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
  const [tabs, setTabs] = useState(["https://www.example.com"]); // タブの初期状態
  const [activeTab, setActiveTab] = useState(0);

  const addTab = () => {
    setTabs([...tabs, "https://www.example.com"]);
    setActiveTab(tabs.length);
  };

  const changeTab = (index: number) => {
    setActiveTab(index);
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
          {window_icon === "src/assets/icons/startmenu/icons8-microsoft-edge.svg" ? (
            <div>
              <div className={styles.tabbar}>
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    className={activeTab === index ? styles.activeTab : ""}
                    onClick={() => changeTab(index)}
                  >
                    Tab {index + 1}
                  </button>
                ))}
                <button onClick={addTab}>
                  <AddTabIcon />
                </button>
              </div>
              <iframe
                src={tabs[activeTab]}
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            </div>
          ) : window_icon === "src/assets/icons/taskbar/file_explorer.webp" ? (
            <div className={styles.file_explorer}>
              {/* Windows風のファイルエクスプローラをここに実装 */}
              <h4>ファイル エクスプローラ</h4>
              <ul>
                <li>Documents</li>
                <li>Downloads</li>
                <li>Pictures</li>
                <li>Music</li>
              </ul>
            </div>
          ) : (
            <>
              <img
                class={styles.content_image}
                src={window_icon}
                alt={window_name}
              />
              <h4>Coming Soon!</h4>
            </>
          )}
        </div>
      </div>
    </Rnd>
  );
};
