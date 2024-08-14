import { FC, useEffect, useState } from 'react';
import { Form, FormInstance, Input } from "antd";
import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

interface RichTextEditorProps {
  name: string;
  form: FormInstance<any>;
  isArray?: boolean;
  arrayIndex?: number;
  formName?: any;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: FC<RichTextEditorProps> = (props) => {
  const {
    name, form, isArray, arrayIndex, formName, placeholder, className
  } = props;

  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const onEditorStateChange = (editorState: EditorState) => {
    setEditorState(editorState);
    let rawData = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    if (isArray) {
      let fieldName: any = [formName, arrayIndex, name];
      form?.setFields([{ name: fieldName, value: rawData }]);
    } else {
      form?.setFieldsValue({ [name]: rawData });
    }
  };

  useEffect(() => {
    let content: string;
    if (isArray) {
      let __content = form?.getFieldValue([formName]);
      content = (__content && __content[arrayIndex!]) ? __content[arrayIndex!][name] : ''
    } else {
      content = form?.getFieldValue(name);
    }

    if (content) {
      const contentBlocks = convertFromHTML(content).contentBlocks;
      const blockArray = ContentState.createFromBlockArray(contentBlocks);
      const initalEditorState = EditorState.createWithContent(blockArray);

      setEditorState(initalEditorState);
    }
  }, [])

  return (
    <div className='border py-2'>
      <Form.Item hidden name={name}>
        <Input type="hidden" />
      </Form.Item>

      <Editor
        editorState={editorState}
        editorClassName={`rte-editor ${className}`}
        onEditorStateChange={onEditorStateChange}
        placeholder={placeholder || "Description"}
        spellCheck={true}
      />
    </div>
  );
}