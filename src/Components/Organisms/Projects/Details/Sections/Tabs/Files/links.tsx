import { useState, type FC, useCallback, useEffect } from 'react';
import { Form, Popconfirm } from 'antd';
import { ProjectTypes } from '@modules/Project/types';
import { CustomInput } from '@atoms/';
import { DeleteIcon, PlusCircleIcon } from '@icons/';
import styles from './styles.module.scss';

interface LinksTabProps {
  project: {
    data: ProjectTypes
    onRefresh: <QueryType = any>(query?: QueryType) => void
  }
  /** Function to edit project detail
  * @param {ProjectTypes} values updated values of the project
  * @param {number} id id of the project to be updated
  */
  onEdit: (values: Partial<ProjectTypes>, id: number) => void
}

const LinksTab: FC<LinksTabProps> = ({ onEdit, project }) => {
  const { data: projectData } = project
  const [form] = Form.useForm();
  const [projectFileLinks, setProjectFileLinks] = useState<{ name?: string, link: string }[]>([])

  const projectLinkActions = useCallback((link: string, action: 'add' | 'remove', linkName?: string) => {
    switch (action) {
      case 'add': {
        // if the link is already present in the array, then don't add it
        let existingLink = projectFileLinks.find((ele) => ele.link === link)
        if (existingLink) return

        const allLinks = [...projectFileLinks, { name: linkName, link: link }]
        setProjectFileLinks(allLinks)
        form.setFieldsValue({ projectFilesLink: '', projectFilesLinkName: '' })

        // update the project file links in the database
        onEdit({ projectFilesLink: allLinks.join(',') }, projectData?.id)
        break;
      }
      case 'remove': {
        const removeLink = projectFileLinks.filter((item) => item.link !== link)
        setProjectFileLinks(removeLink)
        // update the project file links in the database
        onEdit({ projectFilesLink: JSON.stringify(removeLink) }, projectData?.id)
        break;
      }
    }
  }, [projectFileLinks])

  useEffect(() => {
    try {
      const links = JSON.parse(projectData?.projectFilesLink);
      if (typeof links === "string") {
        setProjectFileLinks([{ link: links }])
      } else {
        setProjectFileLinks(links)
      }
    } catch (err) {
      console.log("Some error while parsing links");
    }
  }, [])

  return (
    <Form form={form}>
      {/** Project files link */}
      <div className={styles.linkFormContainer}>
        <Form.Item
          style={{ width: '50%', marginTop: 10 }}
          name="projectFilesLinkName"
        >
          {/* <CustomInput label={"Link Name"}
            style={{ fontSize: "var(--font-size-normal)" }}
            size='w100'
            placeHolder='Name of the link' /> */}
          <CustomInput
            label='Link Name'
            placeHolder="Name of the link"
            className={styles.projectFilesLinkName}
            size='w100'
          />
        </Form.Item>
        <Form.Item
          name="projectFilesLink"
          rules={[
            {
              required: projectFileLinks?.length === 0 ? true : false,
              message: "Please add at least one link."
            },
            { type: 'url', message: "Please enter a valid url." },

            () => ({
              validator(_, value) {
                if (!value || !projectFileLinks?.includes(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('This link is already added.'));
              },
            }),
          ]}
          style={{ marginTop: 10, width: "50%" }}
        >
          <CustomInput
            label='Project Files Link'
            placeHolder="Add project file link"
            size='w100'
            suffix={
              <PlusCircleIcon
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const enteredLink = form.getFieldValue('projectFilesLink');
                  const linkName = form.getFieldValue('projectFilesLinkName');
                  projectLinkActions(enteredLink, 'add', linkName);
                }}
              />
            }
          />
        </Form.Item>
      </div>
      {/** Project files link list */}
      <div className={styles.projectFileLinks}>
        {projectFileLinks?.map((link, index) => (
          <div
            key={`${link}-${index}`}
            className={styles.projectFileLink}
          >
            <a href={link.link} target="_blank" rel="noreferrer">
              {(link.name) ? link.name : link.link}
            </a>
            <Popconfirm
              title="Are you sure to delete this link?"
              okText="Yes" cancelText="No" placement='left'
              onConfirm={() => projectLinkActions(link.link, 'remove')}
            >
              <DeleteIcon className={styles.projectFileLink__deleteIcon} />
            </Popconfirm>
          </div>
        ))}
      </div>
    </Form>
  );
}
export default LinksTab;