import { useEffect, useState, Dispatch, SetStateAction, useCallback, useRef } from "react";
import { handleError } from "@helpers/common";
import { AxiosResponse } from "axios";

// The type of the query params for the API
type QueryType<T = any> = T

type UseFetchDataProps<QT = QueryType> = {
  /** The method to call to fetch the data */
  method: (query?: QueryType) => Promise<AxiosResponse<any, any>>
  /** The initial query params to call the API with */
  initialQuery?: Partial<QT>
}

type UseConditionFetchDataProps = {
  /** A condition to satisfy before calling the API */
  condition: any
} & UseFetchDataProps

/** The return type of the useFetchData hook */
export type UseFetchDataReturn<DataType = any> = {
  /** The data returned from the API */
  data: DataType | undefined;
  /** A function to set the data */
  setData: Dispatch<SetStateAction<DataType | undefined>>;
  /** Whether the data fetching is in progress */
  loading: boolean;
  /** The error returned from the request */
  error?: any;
  /** The meta data returned from the API
   * @property `page` - The current page
   * @property `perPage` - The number of items per page
   * @property `total` - The total number of items
   * @property `pageCount` - The total number of pages
   */
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    pageCount?: number;
  };
  /** A function to refresh the data */
  onRefresh: <QueryType = any>(query?: QueryType) => void;
  setMeta: Dispatch<UseFetchDataReturn['meta']>;
}

/**
 * A custom hook to fetch data from an API
 * @param method The method to call to fetch the data
 * @param initialQuery The initial query params to call the API with
 * @param path The path to the data you want to fetch (Useful when you want to fetch by `id`, `slug` or something)
 * @type `DataType` - The types for the data returned from the API
 * @type `QT` - The types for the query params for the API
 * @returns An object containing the `data`, `loading`, `error` and `meta` data
 * @example
 * const { data, loading, error, meta, onRefresh } = useFetchData<UserTypes>({ method: userModule.getUsers });
 * 
 * if (loading) {
 *   return <Loading />;
 * }
 * 
 * if (error) {
 *   return <Error />;
 * }
 * 
 * return (
 *   <div>
 *     {data?.map((item) => (
 *        <div key={item.id}>{item.name}</div>
 *     ))}
 * 
 *     <Button onClick={onRefresh}>Refresh</Button>
 *   </div>
 * );
 * */
export function useFetchData<DataType = any, QT = any>(props: UseFetchDataProps<QT>): UseFetchDataReturn<DataType> {
  const { method, initialQuery } = props;

  const [data, setData] = useState<DataType>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>();
  const [meta, setMeta] = useState<UseFetchDataReturn['meta']>();

  const hasInitialQuery = useRef(true);

  const getData = useCallback((query?: QueryType) => {
    setLoading(true);
    const queryToUse = hasInitialQuery.current ? initialQuery : query;
    hasInitialQuery.current = false;
    method(queryToUse).then((res) => {
      setData(res?.data?.data);
      setMeta(res?.data?.meta);
      setError(res?.data?.message);
    }).catch((err) => {
      const errorMessage = handleError(err);
      setError(errorMessage);
    }).finally(() => {
      setLoading(false);
    })
  }, [method, initialQuery]);

  useEffect(() => {
    getData();
  }, []);

  return {
    data, setData, meta, loading, error,
    setMeta, onRefresh: getData,
  };
}


/**
 * A custom hook to fetch data from an API with condition change
 * @param method The method to call to fetch the data when the condition is not undefined
 * @param condition The condition to call the method (when the condition is undefined or false, the method will not be called)
 * @param initialQuery The initial query params to call the API with
 * @param path The path to the data you want to fetch (Useful when you want to fetch by `id`, `slug` or something)
 * @type `DataType` - The types for the data returned from the API
 * @type `QT` - The types for the query params for the API
 * @returns An object containing the `data`, `loading`, `error` and `meta` data
 **/

export function useConditionFetchData<DataType = any, QT = any>(props: UseConditionFetchDataProps) {
  const { method, condition, initialQuery } = props;
  const isMounted = useRef(false);
  const fetchData = useFetchData<DataType, QT>({
    method: condition ? method : () => Promise.resolve({} as AxiosResponse<any, DataType>),
    initialQuery,
  });

  useEffect(() => {
    if (isMounted.current && condition) {
      fetchData.onRefresh(initialQuery);
    } else {
      isMounted.current = true;
    }
  }, [condition]);

  return fetchData;
}