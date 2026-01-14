/**
 * Generic type for paginated responses from the API
 */
export interface Page<T> {
  /**
   * The content of the page
   */
  content: T[];
  
  /**
   * Pagination information
   */
  pageable: {
    /**
     * The page number (0-based)
     */
    pageNumber: number;
    
    /**
     * The page size
     */
    pageSize: number;
    
    /**
     * The offset of the page
     */
    offset: number;
  };
  
  /**
   * The total number of elements
   */
  totalElements: number;
  
  /**
   * The total number of pages
   */
  totalPages: number;
  
  /**
   * Whether this is the last page
   */
  last: boolean;
  
  /**
   * Whether this is the first page
   */
  first: boolean;
  
  /**
   * The number of elements in this page
   */
  numberOfElements: number;
  
  /**
   * The size of the page
   */
  size: number;
  
  /**
   * The number of the page (0-based)
   */
  number: number;
  
  /**
   * Whether the page is empty
   */
  empty: boolean;
}