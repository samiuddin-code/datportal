import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from 'react';

type NavSidebarContextType = {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
};

type NavSidebarProviderProps = {
  children: ReactNode;
};

const NavSidebarContext = createContext<NavSidebarContextType>({
  collapsed: false,
  setCollapsed: () => { },
});

/**
 * This hook is used to manage the state of the navigation sidebar
 * @example
 * const { collapsed, setCollapsed } = useNavSidebar()
 */
export const useNavSidebar = () => {
  const { collapsed, setCollapsed } = useContext(NavSidebarContext);

  const closeOnMobileLink = () => {
    if (window.innerWidth <= 820) {
      setCollapsed(true)
    }
  }

  return { collapsed, setCollapsed, closeOnMobileLink }
};

/** This navigation sidebar context provider */
export const NavSidebarProvider = ({ children }: NavSidebarProviderProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const isMobileOrTablet = window.innerWidth <= 820;
    const storedState = localStorage.getItem('navSidebarCollapsed');
    // if the user is on mobile or tablet, then the sidebar should be collapsed by default 
    return isMobileOrTablet ? true : storedState ? JSON.parse(storedState) : false;
  });

  useEffect(() => {
    localStorage.setItem('navSidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  return (
    <NavSidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </NavSidebarContext.Provider>
  );
};