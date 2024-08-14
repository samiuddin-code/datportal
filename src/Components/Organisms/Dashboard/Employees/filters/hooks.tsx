import { message } from "antd";
import { AxiosResponse } from "axios";
import { useCallback, useState } from "react";

interface SearchParams {
  name?: string;
  title?: string;
}

interface SearchState<T> {
  data: T[];
  loading: boolean;
}

interface RecordWithId extends Record<string, any> {
  id: number;
}

interface SearchHook<T> {
  state: SearchState<T & RecordWithId>;
  search: (params: SearchParams) => void;
}

/** A custom hook to search for Employees and Roles */
export function useSearch<T>(getAllRecords: (params: SearchParams) => Promise<AxiosResponse<{ data: (T & RecordWithId)[] }>>): SearchHook<T> {
  const [state, setState] = useState<SearchState<T & RecordWithId>>({ data: [], loading: false });

  const search = useCallback((params: SearchParams) => {
    if (params.name !== undefined || params.title !== undefined) {
      setState((prev) => ({ ...prev, loading: true }));
      getAllRecords(params).then((res) => {
        const { data } = res.data;
        setState((prev) => {
          // if the data is already present in the state, then don't add it again
          const filteredData = data?.filter((item) => {
            return !prev?.data.find((prevItem) => prevItem?.id === item.id);
          });
          // add the new data to the existing data
          return {
            data: [...prev.data, ...filteredData],
            loading: false,
          };
        });
      }).catch((err) => {
        message.error(err?.response?.data?.message || "Something went wrong");
        setState((prev) => ({ ...prev, loading: false }));
      });
    }
  }, []);

  return { state, search };
}