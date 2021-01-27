import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import { Loading } from 'src/components';
import { ButtonLink, DownloadLink } from 'src/components/links';
import { Heading, TranslatableText } from 'src/components/text';
import { Error, Stack } from 'src/components/matchbox';
import { FileType } from '@sparkpost/matchbox-icons';
import exampleRecipientValidationListPath from './example-recipient-validation-list.csv';

import OGStyles from './FileUploadWrapper.module.scss';
import hibanaStyles from './FileUploadWrapperHibana.module.scss';
import useHibanaOverride from 'src/hooks/useHibanaOverride';

export class FileUploadWrapperClass extends Component {
  handleCancel = () => {
    this.props.input.onBlur(); // run validation
  };

  // Always set value to dropped file even if rejected for validate functions to set error
  handleDrop = (acceptedFiles, rejectedFiles) => {
    const files = [...acceptedFiles, ...rejectedFiles];
    this.props.input.onChange(files[0]);
    this.props.input.onBlur(); // run validation
  };

  handleOpen = () => {
    this.dropzoneRef.open();
  };

  setDropzoneRef = ref => {
    this.dropzoneRef = ref;
  };

  render() {
    const { input, styles, meta, uploading } = this.props;

    if (uploading) {
      return (
        <div className={styles.Field}>
          <Stack>
            <Heading as="h3">Uploading...</Heading>

            <p>Your list will be ready to validate in just a moment.</p>

            <div className={styles.LoadingWrapper}>
              <Loading />
            </div>
          </Stack>
        </div>
      );
    }

    return (
      <div className={styles.Field}>
        <Stack>
          <Heading as="h3">Drag and drop your list here</Heading>

          <p>
            <TranslatableText>or </TranslatableText>
            <ButtonLink onClick={this.handleOpen}>select a file</ButtonLink>
            <TranslatableText> to upload.</TranslatableText>
          </p>

          <div className={styles.InputWrapper}>
            <Dropzone
              accept={['.txt', '.csv']}
              activeClassName={styles.Active}
              className={styles.Dropzone}
              id={input.id}
              multiple={false}
              name={input.name}
              onDrop={this.handleDrop}
              onFileDialogCancel={this.handleCancel}
              ref={this.setDropzoneRef}
            >
              <div className={styles.FileTypeWrapper}>
                <div>
                  <FileType text="CSV" size={80} />
                </div>
                <div>
                  <FileType text="TXT" size={80} />
                </div>
              </div>
            </Dropzone>
          </div>
          {meta.touched && meta.error ? (
            <p>
              <Error error={meta.error} wrapper="span" />
            </p>
          ) : null}
          <p className={styles.Help}>
            Format your list with single addresses on individual lines, or{' '}
            <DownloadLink href={exampleRecipientValidationListPath}>download</DownloadLink> our csv
            template. Please note, only the most recent list is only{' '}
            <strong>kept for 10 days</strong>, so be sure to download your validated list right
            away!
          </p>
        </Stack>
      </div>
    );
  }
}

export default function FileUploadWrapper(props) {
  const styles = useHibanaOverride(OGStyles, hibanaStyles);
  return <FileUploadWrapperClass styles={styles} {...props} />;
}
