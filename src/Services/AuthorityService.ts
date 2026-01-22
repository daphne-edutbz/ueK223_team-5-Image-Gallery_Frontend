import authorities from '../config/Authorities';
import { Authority } from '../types/models/Authority.model';
import { Role } from '../types/models/Role.model';

/** Internes Set zur Speicherung der Berechtigungen des aktiven Users */
const authoritySet = new Set<authorities>();

/**
 * Service zur Verwaltung und Prüfung von User-Berechtigungen
 */
const AuthorityService = {
  /**
   * Initialisiert das Authority-Set basierend auf den Rollen des Users
   * @param user - User-Objekt (Standard: aus localStorage)
   */
  initAuthoritySet: (
    user = JSON.parse(localStorage.getItem('user') || '{}')
  ) => {
    const roles = user && user.roles ? user.roles : [];
    roles.forEach((role: Role) => {
      role.authorities.forEach((authority: Authority) => {
        authoritySet.add(authority.name);
      });
    });
  },

  /**
   * Prüft ob der User eine bestimmte Berechtigung hat
   * @param authority - Zu prüfende Berechtigung
   * @returns true wenn Berechtigung vorhanden
   */
  hasAuthority: (authority: authorities) => {
    AuthorityService.initAuthoritySet();
    return authoritySet.has(authority);
  },

  /**
   * Prüft ob der User ALLE angegebenen Berechtigungen hat
   * @param authorities - Array von Berechtigungen
   * @returns true wenn alle Berechtigungen vorhanden
   */
  hasAuthorities: (authorities: authorities[]) => {
    AuthorityService.initAuthoritySet();
    for (const element of authorities) {
      if (!authoritySet.has(element)) {
        return false;
      }
    }
    return true;
  },

  /**
   * Prüft ob der User MINDESTENS EINE der angegebenen Berechtigungen hat
   * @param authorities - Array von Berechtigungen
   * @returns true wenn mindestens eine Berechtigung vorhanden
   */
  hasAnyAuthority: (authorities: authorities[]) => {
    for (const element of authorities) {
      if (authoritySet.has(element)) {
        return true;
      }
    }
    return false;
  },

  /**
   * Löscht alle gespeicherten Berechtigungen (z.B. bei Logout)
   */
  clearAuthorities: (): void => {
    authoritySet.clear();
  },
};

export default AuthorityService;
