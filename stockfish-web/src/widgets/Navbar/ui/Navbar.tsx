import { classNames } from "shared/lib/classNames/classNames";
import { AppLink, AppLinkTheme } from "shared/ui/AppLink/AppLink";
import cls from "./Navbar.module.scss";
import { RoutePath } from "shared/config/routeConfig/routeConfig";

interface NavbarProps {
  className?: string;
}

export const Navbar = ({ className }: NavbarProps) => {
  return (
    <div className={classNames(cls.Navbar, {}, [className])}>
      <div className={cls.items}>
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
      </div>
    </div>
  );
};
