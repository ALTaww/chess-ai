import { classNames } from "shared/lib/classNames/classNames";
import { AppLink, AppLinkTheme } from "shared/ui/AppLink/AppLink";
import cls from "./Navbar.module.scss";
import { RoutePath } from "shared/config/routeConfig/routeConfig";
import GithubImg from "shared/assets/github-mark-white.png";

interface NavbarProps {
  className?: string;
}

export const Navbar = ({ className }: NavbarProps) => {
  return (
    <div className={classNames(cls.Navbar, {}, [className])}>
      <div className={cls.items}>
        <div className={`${cls.item}`} style={{ padding: "0 5px" }}>
          <a
            className={cls.link}
            href="https://github.com/ALTaww/chess-ai"
            target="_blank"
            rel="noreferrer"
          >
            <img src={GithubImg} alt="Github repo" width={18} height={18} />
          </a>
        </div>
        <div className={`${cls.item} ${cls.mainLink}`}>
          <AppLink theme={AppLinkTheme.SECONDARY} to={RoutePath.main}>
            <span className={cls.link}>Главная страница</span>
          </AppLink>
        </div>
        <div className={cls.item}>
          <AppLink
            theme={AppLinkTheme.SECONDARY}
            to={RoutePath.stockfish_online}
          >
            <span className={cls.link}>Stockfish online</span>
          </AppLink>
        </div>
        <div className={cls.item}>
          <AppLink theme={AppLinkTheme.SECONDARY} to={RoutePath.play}>
            <span className={cls.link}>Играть</span>
          </AppLink>
        </div>
        <div className={cls.item}>
          <AppLink theme={AppLinkTheme.SECONDARY} to={RoutePath.analyze}>
            <span className={cls.link}>Анализировать позицию</span>
          </AppLink>
        </div>
        <div className={cls.item}>
          <AppLink theme={AppLinkTheme.SECONDARY} to={RoutePath.board_editor}>
            <span className={cls.link}>Редактор доски</span>
          </AppLink>
        </div>
      </div>
    </div>
  );
};
